// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HerbChain {

    // --- 1. CORE DATA STRUCTURES ---
    struct HerbBatch {
        uint256 id;
        string metadataCID; // 🚀 OPTIMIZED: The single IPFS Hash containing the JSON with all details
        address farmer;
        uint8 stage;        // 0=Harvested, 1=Processed, 2=Verified, 3=Sold
        bool exists;
    }

    struct LabData {
        string reportIPFS;  // Hash of the PDF Report
        string purity;      
        string notes;       
        uint256 timestamp;
        address labTech;
    }

    // --- 2. MAPPINGS & STATE ---
    mapping(uint256 => HerbBatch) public batches;
    mapping(uint256 => LabData) public labReports;
    
    uint256 public nextBatchId = 101; 

    // --- 3. EVENTS ---
    event BatchCreated(uint256 indexed id, string metadataCID, address indexed farmer);
    event StageUpdated(uint256 indexed id, uint8 newStage);
    event BatchVerified(uint256 indexed id, address indexed labTech, string purity);

    // --- 4. CORE FUNCTIONS ---

    // STEP 1: FARMER (Creates the Batch)
    // Now only takes the single CID string from the Java Backend
    function createBatch(string memory _metadataCID) public {
        batches[nextBatchId] = HerbBatch({
            id: nextBatchId,
            metadataCID: _metadataCID,
            farmer: msg.sender,
            stage: 0, 
            exists: true
        });
        
        emit BatchCreated(nextBatchId, _metadataCID, msg.sender);
        nextBatchId++;
    }

    // STEP 2 & 4: MANUFACTURER / DISTRIBUTOR (General Stage Updates)
    function updateStage(uint256 _id, uint8 _newStage) public {
        require(batches[_id].exists, "Batch does not exist!");
        require(_newStage > batches[_id].stage, "Cannot go backwards!");
        
        batches[_id].stage = _newStage;
        emit StageUpdated(_id, _newStage);
    }

    // STEP 3: LAB (Verification - The Special Function)
    function verifyBatch(
        uint256 _id, 
        string memory _reportIPFS, 
        string memory _purity, 
        string memory _notes
    ) public {
        require(batches[_id].exists, "Batch does not exist!");
        require(batches[_id].stage == 1, "Batch must be Processed before Verification");

        // 1. Update Stage to 2 (Verified)
        batches[_id].stage = 2;

        // 2. Save Lab Data
        labReports[_id] = LabData({
            reportIPFS: _reportIPFS,
            purity: _purity,
            notes: _notes,
            timestamp: block.timestamp,
            labTech: msg.sender
        });

        // 3. Emit Events
        emit StageUpdated(_id, 2);
        emit BatchVerified(_id, msg.sender, _purity);
    }

    // --- 5. GETTERS ---

    function getBatch(uint256 _id) public view returns (HerbBatch memory) {
        require(batches[_id].exists, "Batch not found");
        return batches[_id];
    }

    function getLabReport(uint256 _id) public view returns (LabData memory) {
        require(labReports[_id].timestamp != 0, "No lab report found");
        return labReports[_id];
    }
}

