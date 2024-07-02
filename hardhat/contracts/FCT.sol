// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FCT {

    struct Volume {
        string id; // UUID v4
        string name;
        string ip;
        address owner;
        uint256 timestamp;
        string checksum;
    }

    address private _owner;

    // Mapping from volume ID to an array of versions
    mapping(string => Volume[]) private volumeHistory;
    mapping(string => bool) private checksumExists; // Mapping to track existing checksums
    string[] private fileIds; // Array to keep track of all volume IDs

    event VolumeAdded(string id, string name, string ip, address owner, uint256 timestamp, string checksum);
    event VolumeUpdated(string id, string name, string ip, address owner, uint256 timestamp, string checksum);
    event VolumeRemoved(string id, string name, string ip, address owner, uint256 timestamp, string checksum);

    uint256 constant ONE_YEAR = 365 days;

    constructor(address contractOwner) {
        _owner = contractOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not the contract owner");
        _;
    }

    // Method to insert a new volume version
    function insertVolume(string memory id, string memory name, string memory ip, address owner, string memory checksum) public {
        require(!checksumExists[checksum], "Volume with this checksum already exists");

        uint256 timestamp = block.timestamp;

        Volume memory newVolume = Volume(id, name, ip, owner, timestamp, checksum);
        volumeHistory[id].push(newVolume);
        checksumExists[checksum] = true; // Mark checksum as existing

        // Add the volume ID to the list if it is a new volume
        if (volumeHistory[id].length == 1) {
            fileIds.push(id);
        }

        emit VolumeAdded(id, name, ip, owner, timestamp, checksum);
    }

    // Method to update a specific volume, adding a new version
    function updateVolume(string memory id, string memory name, string memory ip, string memory newChecksum) public {
        require(!checksumExists[newChecksum], "Volume with this checksum already exists");

        uint256 timestamp = block.timestamp;

        // Ensure the volume exists before updating
        require(volumeHistory[id].length > 0, "Volume does not exist");

        Volume memory updatedVolume = Volume(id, name, ip, volumeHistory[id][0].owner, timestamp, newChecksum);
        volumeHistory[id].push(updatedVolume);
        checksumExists[newChecksum] = true; // Mark new checksum as existing

        emit VolumeUpdated(id, name, ip, updatedVolume.owner, timestamp, newChecksum);
    }

    // Method to get the history of a specific volume by ID
    function getVolumeHistory(string memory id) public view returns (Volume[] memory) {
        return volumeHistory[id];
    }

    // Method to list all the volumes with their latest versions
    function listLatestVolumes() public view returns (Volume[] memory) {
        uint256 count = fileIds.length;
        Volume[] memory latestVolumes = new Volume[](count);
        for (uint256 i = 0; i < count; i++) {
            string memory id = fileIds[i];
            latestVolumes[i] = volumeHistory[id][volumeHistory[id].length - 1];
        }
        return latestVolumes;
    }

    // Method to remove volumes older than one year
    // sfoltire il passato, perche se un volume piu vecchio di 1 anno ma non usato, poche history, voglio tenerlo
    function removeOldVolumes() public onlyOwner {
        uint256 currentTime = block.timestamp;
        uint256 i = 0;

        while (i < fileIds.length) {
            string memory id = fileIds[i];
            Volume[] storage volumes = volumeHistory[id];
            bool volumeRemoved = false;

            for (uint256 j = 0; j < volumes.length;) {
                if (currentTime - volumes[j].timestamp > ONE_YEAR) {
                    delete checksumExists[volumes[j].checksum];
                    emit VolumeRemoved(volumes[j].id, volumes[j].name, volumes[j].ip, volumes[j].owner, volumes[j].timestamp, volumes[j].checksum);
                    volumes[j] = volumes[volumes.length - 1];
                    volumes.pop();
                    volumeRemoved = true;
                } else {
                    j++;
                }
            }

            if (volumes.length == 0) {
                volumeHistory[id] = volumeHistory[fileIds[fileIds.length - 1]];
                fileIds[i] = fileIds[fileIds.length - 1];
                fileIds.pop();
            } else {
                i++;
            }
        }
    }
}
