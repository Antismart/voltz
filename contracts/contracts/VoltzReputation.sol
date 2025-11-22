// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title VoltzReputation
 * @notice Reputation system for Voltz platform with verifiable scoring
 * @dev Uses a points-based system with AI-verified contributions
 */
contract VoltzReputation is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct ReputationScore {
        uint256 totalScore;
        uint256 eventAttendance; // Points from attending events
        uint256 qualityConnections; // Points from verified connections
        uint256 workshopParticipation; // Points from workshop attendance
        uint256 credentialVerifications; // Points from verified credentials
        uint256 communityFeedback; // Points from peer ratings
        uint256 lastUpdated;
    }

    struct ScoreUpdate {
        address user;
        uint256 points;
        string category; // event, connection, workshop, credential, feedback
        string proofURI; // 0G DA URI to verifiable proof
        uint256 timestamp;
    }

    // User address => Reputation Score
    mapping(address => ReputationScore) public scores;

    // Score update history
    mapping(address => ScoreUpdate[]) public scoreHistory;

    // Tier thresholds
    uint256 public constant BRONZE_THRESHOLD = 100;
    uint256 public constant SILVER_THRESHOLD = 500;
    uint256 public constant GOLD_THRESHOLD = 1000;
    uint256 public constant PLATINUM_THRESHOLD = 2500;

    // Score weights (in basis points, 100 = 1%)
    uint256 public eventAttendanceWeight = 5000; // 50 points per event
    uint256 public qualityConnectionWeight = 1500; // 15 points per connection
    uint256 public workshopWeight = 3000; // 30 points per workshop
    uint256 public credentialWeight = 10000; // 100 points per credential
    uint256 public feedbackWeight = 1200; // 12 points per positive feedback

    // Events
    event ScoreUpdated(
        address indexed user,
        uint256 newTotal,
        string category,
        uint256 points
    );
    event TierAchieved(address indexed user, string tier, uint256 score);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Add reputation points to a user
     * @param user The user address
     * @param points Points to add
     * @param category Category of the score update
     * @param proofURI URI to verifiable proof on 0G DA
     */
    function addScore(
        address user,
        uint256 points,
        string memory category,
        string memory proofURI
    ) public onlyRole(VERIFIER_ROLE) {
        ReputationScore storage score = scores[user];
        uint256 previousTotal = score.totalScore;

        // Update category-specific score
        if (keccak256(bytes(category)) == keccak256("event")) {
            score.eventAttendance += points;
        } else if (keccak256(bytes(category)) == keccak256("connection")) {
            score.qualityConnections += points;
        } else if (keccak256(bytes(category)) == keccak256("workshop")) {
            score.workshopParticipation += points;
        } else if (keccak256(bytes(category)) == keccak256("credential")) {
            score.credentialVerifications += points;
        } else if (keccak256(bytes(category)) == keccak256("feedback")) {
            score.communityFeedback += points;
        }

        score.totalScore += points;
        score.lastUpdated = block.timestamp;

        // Record in history
        scoreHistory[user].push(
            ScoreUpdate({
                user: user,
                points: points,
                category: category,
                proofURI: proofURI,
                timestamp: block.timestamp
            })
        );

        emit ScoreUpdated(user, score.totalScore, category, points);

        // Check for tier achievements
        checkTierAchievement(user, previousTotal, score.totalScore);
    }

    /**
     * @notice Batch add scores for multiple users
     * @param users Array of user addresses
     * @param points Array of points to add
     * @param categories Array of categories
     * @param proofURIs Array of proof URIs
     */
    function batchAddScores(
        address[] memory users,
        uint256[] memory points,
        string[] memory categories,
        string[] memory proofURIs
    ) public onlyRole(VERIFIER_ROLE) {
        require(
            users.length == points.length &&
                points.length == categories.length &&
                categories.length == proofURIs.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < users.length; i++) {
            addScore(users[i], points[i], categories[i], proofURIs[i]);
        }
    }

    /**
     * @notice Get user's reputation score
     * @param user The user address
     * @return ReputationScore The user's reputation score
     */
    function getScore(address user) public view returns (ReputationScore memory) {
        return scores[user];
    }

    /**
     * @notice Get user's reputation tier
     * @param user The user address
     * @return string The tier name
     */
    function getTier(address user) public view returns (string memory) {
        uint256 score = scores[user].totalScore;

        if (score >= PLATINUM_THRESHOLD) return "Platinum";
        if (score >= GOLD_THRESHOLD) return "Gold";
        if (score >= SILVER_THRESHOLD) return "Silver";
        if (score >= BRONZE_THRESHOLD) return "Bronze";
        return "Newcomer";
    }

    /**
     * @notice Get user's score history
     * @param user The user address
     * @return ScoreUpdate[] Array of score updates
     */
    function getScoreHistory(address user) public view returns (ScoreUpdate[] memory) {
        return scoreHistory[user];
    }

    /**
     * @notice Check and emit tier achievement
     */
    function checkTierAchievement(
        address user,
        uint256 previousScore,
        uint256 newScore
    ) internal {
        // Check if user crossed a tier threshold
        if (previousScore < BRONZE_THRESHOLD && newScore >= BRONZE_THRESHOLD) {
            emit TierAchieved(user, "Bronze", newScore);
        } else if (previousScore < SILVER_THRESHOLD && newScore >= SILVER_THRESHOLD) {
            emit TierAchieved(user, "Silver", newScore);
        } else if (previousScore < GOLD_THRESHOLD && newScore >= GOLD_THRESHOLD) {
            emit TierAchieved(user, "Gold", newScore);
        } else if (previousScore < PLATINUM_THRESHOLD && newScore >= PLATINUM_THRESHOLD) {
            emit TierAchieved(user, "Platinum", newScore);
        }
    }

    /**
     * @notice Update score weights (admin only)
     */
    function updateWeights(
        uint256 _eventWeight,
        uint256 _connectionWeight,
        uint256 _workshopWeight,
        uint256 _credentialWeight,
        uint256 _feedbackWeight
    ) public onlyRole(ADMIN_ROLE) {
        eventAttendanceWeight = _eventWeight;
        qualityConnectionWeight = _connectionWeight;
        workshopWeight = _workshopWeight;
        credentialWeight = _credentialWeight;
        feedbackWeight = _feedbackWeight;
    }
}
