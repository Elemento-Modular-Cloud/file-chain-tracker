// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EBVT {

    struct Volume {
        string id; // UUID v4
        string name;
        string ip;
        address owner;
        uint256 timestamp;
        string checksum;
    }

    Volume[] private volumes;
    mapping(string => bool) private checksumExists; // Mapping to track existing checksums
    mapping(string => bool) private seenChecksums; // Mapping to track seen checksums for listLatestVolumes
    uint256 private latestTimestamp;

    event VolumeAdded(string id, string name, string ip, address owner, uint256 timestamp, string checksum);
    event VolumeUpdated(string id, string name, string ip, address owner, uint256 timestamp, string checksum);

    // Method to list all the volumes with unique checksums at the latest timestamp
    function listLatestVolumes() public view returns (Volume[] memory) {
        return volumes;
    }

    // Method to insert a new volume if it does not exist
    function insertVolume(string memory id, string memory name, string memory ip, address owner, string memory checksum) public {
        require(!checksumExists[checksum], "Volume with this checksum already exists");

        uint256 timestamp = block.timestamp;

        volumes.push(Volume(id, name, ip, owner, timestamp, checksum));
        checksumExists[checksum] = true; // Mark checksum as existing

        if (timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
        }

        emit VolumeAdded(id, name, ip, owner, timestamp, checksum);
    }

    // Method to update a specific volume record, updating the timestamp and the checksum
    function updateVolume(string memory id, string memory name, string memory ip, string memory newChecksum) public {
        // Find the volume with the given id
        bool found = false;
        uint256 arrayIndex;
        for (uint256 i = 0; i < volumes.length; i++) {
            if (keccak256(abi.encodePacked(volumes[i].id)) == keccak256(abi.encodePacked(id))) {
                arrayIndex = i;
                found = true;
                break;
            }
        }
        require(found, "Volume does not exist");

        Volume storage volume = volumes[arrayIndex];
        string memory oldChecksum = volume.checksum;

        // Update the volume details
        volume.name = name;
        volume.ip = ip;
        volume.timestamp = block.timestamp;
        volume.checksum = newChecksum;

        // Update the checksumExists mapping with the new checksum
        checksumExists[newChecksum] = true;
        checksumExists[oldChecksum] = false;

        if (volume.timestamp > latestTimestamp) {
            latestTimestamp = volume.timestamp;
        }

        emit VolumeUpdated(id, name, ip, volume.owner, volume.timestamp, newChecksum);
    }
}
