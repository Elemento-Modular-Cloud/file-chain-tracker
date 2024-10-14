// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FCT {

    struct File {
        string id; // UUID v4
        string name;
        string ip;
        address owner;
        uint256 timestamp;
        string checksum;
    }

    address private _owner;

    // Mapping from file ID to an array of versions
    mapping(string => File[]) private fileHistory;
    mapping(string => bool) private checksumExists;
    string[] private fileIds;

    event FileAdded(string id, string name, string ip, address owner, uint256 timestamp, string checksum);
    event FileUpdated(string id, string name, string ip, address owner, uint256 timestamp, string checksum);
    event FileRemoved(string id, string name, string ip, address owner, uint256 timestamp, string checksum);

    uint256 constant ONE_YEAR = 365 days;

    constructor(address contractOwner) {
        _owner = contractOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not the contract owner");
        _;
    }

    // Method to insert a new file version
    function trackNewFile(string memory id, string memory name, string memory ip, address owner, string memory checksum) public {
        require(!checksumExists[checksum], "File with this checksum already exists");

        uint256 timestamp = block.timestamp;

        File memory newFile = File(id, name, ip, owner, timestamp, checksum);
        fileHistory[id].push(newFile);
        checksumExists[checksum] = true; // Mark checksum as existing

        // Add the file ID to the list if it is a new file
        if (fileHistory[id].length == 1) {
            fileIds.push(id);
        }

        emit FileAdded(id, name, ip, owner, timestamp, checksum);
    }

    // Method to update a specific file, adding a new version
    function updateFileMetadata(string memory id, string memory name, string memory ip, string memory newChecksum) public {
        require(!checksumExists[newChecksum], "File with this checksum already exists");

        uint256 timestamp = block.timestamp;

        // Ensure the file exists before updating
        require(fileHistory[id].length > 0, "File does not exist");

        File memory updatedFile = File(id, name, ip, fileHistory[id][0].owner, timestamp, newChecksum);
        fileHistory[id].push(updatedFile);
        checksumExists[newChecksum] = true; // Mark new checksum as existing

        emit FileUpdated(id, name, ip, updatedFile.owner, timestamp, newChecksum);
    }

    // Method to get the history of a specific file by ID
    function getFileHistory(string memory id) public view returns (File[] memory) {
        return fileHistory[id];
    }

    // Method to list all the files with their latest versions
    function listLatestFile() public view returns (File[] memory) {
        uint256 count = fileIds.length;
        File[] memory latestFiles = new File[](count);
        for (uint256 i = 0; i < count; i++) {
            string memory id = fileIds[i];
            latestFiles[i] = fileHistory[id][fileHistory[id].length - 1];
        }
        return latestFiles;
    }
}
