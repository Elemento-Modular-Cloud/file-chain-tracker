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

    // Mapping from volume ID to an array of versions
    mapping(string => Volume[]) private volumeHistory;
    mapping(string => bool) private checksumExists; // Mapping to track existing checksums
    string[] private volumeIds; // Array to keep track of all volume IDs

    event VolumeAdded(string id, string name, string ip, address owner, uint256 timestamp, string checksum);
    event VolumeUpdated(string id, string name, string ip, address owner, uint256 timestamp, string checksum);

    // Method to insert a new volume version
    function insertVolume(string memory id, string memory name, string memory ip, address owner, string memory checksum) public {
        require(!checksumExists[checksum], "Volume with this checksum already exists");

        uint256 timestamp = block.timestamp;

        Volume memory newVolume = Volume(id, name, ip, owner, timestamp, checksum);
        volumeHistory[id].push(newVolume);
        checksumExists[checksum] = true; // Mark checksum as existing

        // Add the volume ID to the list if it is a new volume
        if (volumeHistory[id].length == 1) {
            volumeIds.push(id);
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
        uint256 count = volumeIds.length;
        Volume[] memory latestVolumes = new Volume[](count);
        for (uint256 i = 0; i < count; i++) {
            string memory id = volumeIds[i];
            latestVolumes[i] = volumeHistory[id][volumeHistory[id].length - 1];
        }
        return latestVolumes;
    }
}
