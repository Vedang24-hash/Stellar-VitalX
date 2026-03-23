#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Env, String, Vec, Address, symbol_short};

// Record structure - matches Solidity struct
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Record {
    pub id: u64,
    pub uploader: Address,
    pub ipfs_hash: String,
    pub label: String,
    pub timestamp: u64,
}

// Storage keys
#[contracttype]
pub enum DataKey {
    RecordCount,
    Record(u64),
    UploaderRecords(Address),
}

// Events
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RecordUploadedEvent {
    pub id: u64,
    pub uploader: Address,
    pub ipfs_hash: String,
    pub label: String,
    pub timestamp: u64,
}

// Contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    IpfsHashRequired = 1,
    RecordNotFound = 2,
}

#[contract]
pub struct VitalXRecordStorage;

#[contractimpl]
impl VitalXRecordStorage {
    /// Upload a new record reference (IPFS CID + optional label)
    /// Matches Solidity: uploadRecord(string _ipfsHash, string _label)
    pub fn upload_record(
    env: Env,
    uploader: Address,
    ipfs_hash: String,
    label: String,
) -> u64 {
    uploader.require_auth();

    if ipfs_hash.len() == 0 {
        panic!("IpfsHashRequired");
    }

    let mut count: u64 = env
        .storage()
        .persistent()
        .get(&DataKey::RecordCount)
        .unwrap_or(0);

    count += 1;
    let new_id = count;

    let record = Record {
        id: new_id,
        uploader: uploader.clone(),
        ipfs_hash: ipfs_hash.clone(),
        label: label.clone(),
        timestamp: env.ledger().timestamp(),
    };

    env.storage()
        .persistent()
        .set(&DataKey::Record(new_id), &record);

    env.storage()
        .persistent()
        .set(&DataKey::RecordCount, &count);

    let mut uploader_records: Vec<u64> = env
        .storage()
        .persistent()
        .get(&DataKey::UploaderRecords(uploader.clone()))
        .unwrap_or(Vec::new(&env));

    uploader_records.push_back(new_id);

    env.storage()
        .persistent()
        .set(&DataKey::UploaderRecords(uploader.clone()), &uploader_records);

    env.events().publish(
        (symbol_short!("uploaded"), uploader.clone()),
        RecordUploadedEvent {
            id: new_id,
            uploader,
            ipfs_hash,
            label,
            timestamp: record.timestamp,
        },
    );

    new_id
}

    /// Get a record by its ID
    /// Matches Solidity: getRecord(uint256 _id)
    pub fn get_record(env: Env, id: u64) -> Result<Record, Error> {
        let count: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::RecordCount)
            .unwrap_or(0);

        // Validate record exists
        if id == 0 || id > count {
            return Err(Error::RecordNotFound);
        }

        let record: Record = env
            .storage()
            .persistent()
            .get(&DataKey::Record(id))
            .ok_or(Error::RecordNotFound)?;

        Ok(record)
    }

    /// Get all record IDs uploaded by a specific address
    /// Matches Solidity: getRecordsByUploader(address _uploader)
    pub fn get_records_by_uploader(env: Env, uploader: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UploaderRecords(uploader))
            .unwrap_or(Vec::new(&env))
    }

    /// Get the total number of records
    /// Matches Solidity: recordCount public variable
    pub fn record_count(env: Env) -> u64 {
        env.storage()
            .persistent()
            .get(&DataKey::RecordCount)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_upload_and_get_record() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VitalXRecordStorage);
        let client = VitalXRecordStorageClient::new(&env, &contract_id);

        let uploader = Address::generate(&env);
        let ipfs_hash = String::from_str(&env, "QmTest123abc");
        let label = String::from_str(&env, "test-file.pdf");

        env.mock_all_auths();

        // Upload record
        let record_id = client.upload_record(&uploader, &ipfs_hash, &label);
        assert_eq!(record_id, 1);

        // Get record
        let record = client.get_record(&record_id);
        assert_eq!(record.id, 1);
        assert_eq!(record.uploader, uploader);
        assert_eq!(record.ipfs_hash, ipfs_hash);
        assert_eq!(record.label, label);
    }

    #[test]
    fn test_get_records_by_uploader() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VitalXRecordStorage);
        let client = VitalXRecordStorageClient::new(&env, &contract_id);

        let uploader = Address::generate(&env);
        
        env.mock_all_auths();

        // Upload multiple records
        let id1 = client.upload_record(
            &uploader,
            &String::from_str(&env, "QmHash1"),
            &String::from_str(&env, "file1.pdf"),
        );
        let id2 = client.upload_record(
            &uploader,
            &String::from_str(&env, "QmHash2"),
            &String::from_str(&env, "file2.pdf"),
        );

        // Get uploader's records
        let records = client.get_records_by_uploader(&uploader);
        assert_eq!(records.len(), 2);
        assert_eq!(records.get(0).unwrap(), id1);
        assert_eq!(records.get(1).unwrap(), id2);
    }

    #[test]
    fn test_record_count() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VitalXRecordStorage);
        let client = VitalXRecordStorageClient::new(&env, &contract_id);

        let uploader = Address::generate(&env);
        
        env.mock_all_auths();

        assert_eq!(client.record_count(), 0);

        client.upload_record(
            &uploader,
            &String::from_str(&env, "QmHash1"),
            &String::from_str(&env, "file1.pdf"),
        );

        assert_eq!(client.record_count(), 1);
    }

    #[test]
    #[should_panic(expected = "IpfsHashRequired")]
    fn test_empty_ipfs_hash() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VitalXRecordStorage);
        let client = VitalXRecordStorageClient::new(&env, &contract_id);

        let uploader = Address::generate(&env);
        
        env.mock_all_auths();

        // Should panic with empty IPFS hash
        client.upload_record(
            &uploader,
            &String::from_str(&env, ""),
            &String::from_str(&env, "file.pdf"),
        );
    }
}
