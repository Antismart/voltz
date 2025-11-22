// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VoltzProfile
 * @notice NFT-based user profiles for the Voltz platform
 * @dev Each user gets one soulbound profile NFT containing on-chain metadata
 * Full profile data stored on 0G Storage, referenced by IPFS URI
 */
contract VoltzProfile is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Mapping from wallet address to profile token ID
    mapping(address => uint256) public addressToProfile;

    // Mapping from token ID to wallet address
    mapping(uint256 => address) public profileToAddress;

    // Profile metadata stored on-chain
    struct ProfileData {
        string profileType; // developer, designer, founder, etc.
        uint256 createdAt;
        uint256 updatedAt;
        bool isActive;
        string storageURI; // 0G Storage URI for full profile data
    }

    // Mapping from token ID to profile data
    mapping(uint256 => ProfileData) public profiles;

    // Events
    event ProfileCreated(address indexed owner, uint256 indexed tokenId, string profileType);
    event ProfileUpdated(uint256 indexed tokenId, string storageURI);
    event ProfileDeactivated(uint256 indexed tokenId);

    constructor() ERC721("Voltz Profile", "VOLTZ") Ownable(msg.sender) {
        // Start token IDs at 1
        _tokenIdCounter = 1;
    }

    /**
     * @notice Create a new profile NFT
     * @param to Address to mint the profile to
     * @param profileType Type of profile (developer, designer, etc.)
     * @param storageURI URI pointing to full profile data on 0G Storage
     * @return uint256 The token ID of the newly created profile
     */
    function createProfile(
        address to,
        string memory profileType,
        string memory storageURI
    ) public returns (uint256) {
        require(addressToProfile[to] == 0, "Profile already exists for this address");

        uint256 tokenId = _tokenIdCounter;
        unchecked {
            _tokenIdCounter++;
        }

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, storageURI);

        profiles[tokenId] = ProfileData({
            profileType: profileType,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isActive: true,
            storageURI: storageURI
        });

        addressToProfile[to] = tokenId;
        profileToAddress[tokenId] = to;

        emit ProfileCreated(to, tokenId, profileType);

        return tokenId;
    }

    /**
     * @notice Update profile metadata
     * @param tokenId The profile token ID
     * @param storageURI New URI pointing to updated profile data
     */
    function updateProfile(uint256 tokenId, string memory storageURI) public {
        require(ownerOf(tokenId) == msg.sender, "Not profile owner");
        require(profiles[tokenId].isActive, "Profile is deactivated");

        _setTokenURI(tokenId, storageURI);
        profiles[tokenId].storageURI = storageURI;
        profiles[tokenId].updatedAt = block.timestamp;

        emit ProfileUpdated(tokenId, storageURI);
    }

    /**
     * @notice Deactivate a profile (soft delete)
     * @param tokenId The profile token ID
     */
    function deactivateProfile(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not profile owner");
        profiles[tokenId].isActive = false;

        emit ProfileDeactivated(tokenId);
    }

    /**
     * @notice Get profile data for an address
     * @param user The wallet address
     * @return ProfileData The profile data
     */
    function getProfileByAddress(address user) public view returns (ProfileData memory) {
        uint256 tokenId = addressToProfile[user];
        require(tokenId != 0, "No profile found for this address");
        return profiles[tokenId];
    }

    /**
     * @notice Check if an address has a profile
     * @param user The wallet address
     * @return bool True if profile exists
     */
    function hasProfile(address user) public view returns (bool) {
        return addressToProfile[user] != 0 && profiles[addressToProfile[user]].isActive;
    }

    /**
     * @notice Override transfer to make profiles soulbound (non-transferable)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0))
        // Prevent transfers (from != address(0) && to != address(0))
        require(
            from == address(0) || to == address(0),
            "Profiles are soulbound and cannot be transferred"
        );

        return super._update(to, tokenId, auth);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
