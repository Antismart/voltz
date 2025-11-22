// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title VoltzAttestation
 * @notice Credential attestation contract using vlayer ZK proofs
 * @dev Stores verifiable attestations of user credentials without revealing underlying data
 */
contract VoltzAttestation is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 private _attestationIdCounter;

    enum AttestationType {
        GITHUB,
        TWITTER,
        LINKEDIN,
        CUSTOM
    }

    struct Attestation {
        uint256 id;
        address subject; // The user being attested
        AttestationType attestationType;
        string claim; // e.g., "100+ Solidity commits", "5000+ followers"
        bytes32 proofHash; // Hash of the ZK proof
        string proofURI; // URI to full proof on 0G DA
        address verifier; // Address that created the attestation
        uint256 timestamp;
        uint256 expiresAt; // 0 = never expires
        bool revoked;
    }

    // Attestation ID => Attestation
    mapping(uint256 => Attestation) public attestations;

    // User address => array of attestation IDs
    mapping(address => uint256[]) public userAttestations;

    // Attestation type => User address => array of attestation IDs
    mapping(AttestationType => mapping(address => uint256[])) public attestationsByType;

    // Track if a specific proof has been used (prevent replay)
    mapping(bytes32 => bool) public usedProofs;

    // Events
    event AttestationCreated(
        uint256 indexed id,
        address indexed subject,
        AttestationType attestationType,
        string claim
    );
    event AttestationRevoked(uint256 indexed id);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _attestationIdCounter = 1; // Start at 1
    }

    /**
     * @notice Create a new attestation from a verified proof
     * @param subject The user being attested
     * @param attestationType Type of attestation (GitHub, Twitter, LinkedIn)
     * @param claim The claim being attested (e.g., "100+ Solidity commits")
     * @param proofHash Hash of the ZK proof for verification
     * @param proofURI URI to the full proof on 0G DA
     * @param expiresAt Expiration timestamp (0 = never)
     * @return uint256 The attestation ID
     */
    function createAttestation(
        address subject,
        AttestationType attestationType,
        string memory claim,
        bytes32 proofHash,
        string memory proofURI,
        uint256 expiresAt
    ) public onlyRole(VERIFIER_ROLE) returns (uint256) {
        require(!usedProofs[proofHash], "Proof already used");
        require(
            expiresAt == 0 || expiresAt > block.timestamp,
            "Expiration must be in future"
        );

        uint256 attestationId = _attestationIdCounter;
        unchecked {
            _attestationIdCounter++;
        }

        attestations[attestationId] = Attestation({
            id: attestationId,
            subject: subject,
            attestationType: attestationType,
            claim: claim,
            proofHash: proofHash,
            proofURI: proofURI,
            verifier: msg.sender,
            timestamp: block.timestamp,
            expiresAt: expiresAt,
            revoked: false
        });

        userAttestations[subject].push(attestationId);
        attestationsByType[attestationType][subject].push(attestationId);
        usedProofs[proofHash] = true;

        emit AttestationCreated(attestationId, subject, attestationType, claim);

        return attestationId;
    }

    /**
     * @notice Revoke an attestation
     * @param attestationId The attestation ID to revoke
     */
    function revokeAttestation(uint256 attestationId) public {
        Attestation storage attestation = attestations[attestationId];
        require(
            msg.sender == attestation.verifier ||
                msg.sender == attestation.subject ||
                hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to revoke"
        );
        require(!attestation.revoked, "Already revoked");

        attestation.revoked = true;

        emit AttestationRevoked(attestationId);
    }

    /**
     * @notice Check if an attestation is valid
     * @param attestationId The attestation ID
     * @return bool True if valid (not revoked and not expired)
     */
    function isValid(uint256 attestationId) public view returns (bool) {
        Attestation memory attestation = attestations[attestationId];

        if (attestation.revoked) return false;
        if (attestation.expiresAt != 0 && block.timestamp > attestation.expiresAt)
            return false;

        return true;
    }

    /**
     * @notice Get all attestations for a user
     * @param user The user address
     * @return uint256[] Array of attestation IDs
     */
    function getUserAttestations(address user) public view returns (uint256[] memory) {
        return userAttestations[user];
    }

    /**
     * @notice Get attestations by type for a user
     * @param attestationType The attestation type
     * @param user The user address
     * @return uint256[] Array of attestation IDs
     */
    function getAttestationsByType(AttestationType attestationType, address user)
        public
        view
        returns (uint256[] memory)
    {
        return attestationsByType[attestationType][user];
    }

    /**
     * @notice Get valid attestations for a user
     * @param user The user address
     * @return Attestation[] Array of valid attestations
     */
    function getValidAttestations(address user)
        public
        view
        returns (Attestation[] memory)
    {
        uint256[] memory ids = userAttestations[user];
        uint256 validCount = 0;

        // Count valid attestations
        for (uint256 i = 0; i < ids.length; i++) {
            if (isValid(ids[i])) {
                validCount++;
            }
        }

        // Create array of valid attestations
        Attestation[] memory validAttestations = new Attestation[](validCount);
        uint256 index = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            if (isValid(ids[i])) {
                validAttestations[index] = attestations[ids[i]];
                index++;
            }
        }

        return validAttestations;
    }

    /**
     * @notice Verify a proof hash matches an attestation
     * @param attestationId The attestation ID
     * @param proofHash The proof hash to verify
     * @return bool True if proof hash matches
     */
    function verifyProof(uint256 attestationId, bytes32 proofHash)
        public
        view
        returns (bool)
    {
        return attestations[attestationId].proofHash == proofHash && isValid(attestationId);
    }
}
