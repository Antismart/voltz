// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title VoltzEvent
 * @notice Event management and registration for Voltz platform
 * @dev Handles event creation, registration, check-ins, and attendance tracking
 */
contract VoltzEvent is Ownable {
    uint256 private _eventIdCounter;

    struct Event {
        string name;
        string description;
        string location;
        uint256 startTime;
        uint256 endTime;
        address organizer;
        uint256 maxAttendees;
        uint256 registeredCount;
        uint256 checkedInCount;
        bool isActive;
        string metadataURI; // 0G Storage URI for full event data
    }

    struct Registration {
        uint256 eventId;
        address attendee;
        uint256 registeredAt;
        bool checkedIn;
        uint256 checkedInAt;
        string goals; // Attendee goals for this event
    }

    // Event ID to Event data
    mapping(uint256 => Event) public events;

    // Event ID => Attendee address => Registration
    mapping(uint256 => mapping(address => Registration)) public registrations;

    // Event ID => array of attendee addresses
    mapping(uint256 => address[]) public eventAttendees;

    // User address => array of event IDs they've registered for
    mapping(address => uint256[]) public userEvents;

    // Reference to VoltzProfile contract
    address public profileContract;

    // Events
    event EventCreated(uint256 indexed eventId, string name, address indexed organizer);
    event AttendeeRegistered(uint256 indexed eventId, address indexed attendee);
    event AttendeeCheckedIn(uint256 indexed eventId, address indexed attendee);
    event EventUpdated(uint256 indexed eventId);
    event EventCancelled(uint256 indexed eventId);

    constructor(address _profileContract) Ownable(msg.sender) {
        profileContract = _profileContract;
        _eventIdCounter = 1; // Start at 1
    }

    /**
     * @notice Create a new event
     * @param name Event name
     * @param description Event description
     * @param location Event location
     * @param startTime Event start timestamp
     * @param endTime Event end timestamp
     * @param maxAttendees Maximum number of attendees (0 = unlimited)
     * @param metadataURI URI to full event data on 0G Storage
     * @return uint256 The created event ID
     */
    function createEvent(
        string memory name,
        string memory description,
        string memory location,
        uint256 startTime,
        uint256 endTime,
        uint256 maxAttendees,
        string memory metadataURI
    ) public returns (uint256) {
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");

        uint256 eventId = _eventIdCounter;
        unchecked {
            _eventIdCounter++;
        }

        events[eventId] = Event({
            name: name,
            description: description,
            location: location,
            startTime: startTime,
            endTime: endTime,
            organizer: msg.sender,
            maxAttendees: maxAttendees,
            registeredCount: 0,
            checkedInCount: 0,
            isActive: true,
            metadataURI: metadataURI
        });

        emit EventCreated(eventId, name, msg.sender);

        return eventId;
    }

    /**
     * @notice Register for an event
     * @param eventId The event ID
     * @param goals Attendee's goals for the event
     */
    function registerForEvent(uint256 eventId, string memory goals) public {
        Event storage eventData = events[eventId];
        require(eventData.isActive, "Event is not active");
        require(eventData.startTime > block.timestamp, "Event has already started");
        require(
            registrations[eventId][msg.sender].attendee == address(0),
            "Already registered"
        );
        require(
            eventData.maxAttendees == 0 || eventData.registeredCount < eventData.maxAttendees,
            "Event is full"
        );

        // Check if user has a profile
        require(hasProfile(msg.sender), "Must have a Voltz profile to register");

        registrations[eventId][msg.sender] = Registration({
            eventId: eventId,
            attendee: msg.sender,
            registeredAt: block.timestamp,
            checkedIn: false,
            checkedInAt: 0,
            goals: goals
        });

        eventAttendees[eventId].push(msg.sender);
        userEvents[msg.sender].push(eventId);
        eventData.registeredCount++;

        emit AttendeeRegistered(eventId, msg.sender);
    }

    /**
     * @notice Check in to an event
     * @param eventId The event ID
     * @param attendee The attendee address (for organizer check-ins)
     */
    function checkIn(uint256 eventId, address attendee) public {
        Event storage eventData = events[eventId];
        Registration storage registration = registrations[eventId][attendee];

        require(eventData.isActive, "Event is not active");
        require(registration.attendee != address(0), "Not registered for this event");
        require(!registration.checkedIn, "Already checked in");

        // Either self check-in or organizer can check in attendees
        require(
            msg.sender == attendee || msg.sender == eventData.organizer,
            "Not authorized"
        );

        // Check-in window: from 1 hour before start to event end
        require(
            block.timestamp >= eventData.startTime - 1 hours &&
                block.timestamp <= eventData.endTime,
            "Not within check-in window"
        );

        registration.checkedIn = true;
        registration.checkedInAt = block.timestamp;
        eventData.checkedInCount++;

        emit AttendeeCheckedIn(eventId, attendee);
    }

    /**
     * @notice Get all attendees for an event
     * @param eventId The event ID
     * @return address[] Array of attendee addresses
     */
    function getEventAttendees(uint256 eventId) public view returns (address[] memory) {
        return eventAttendees[eventId];
    }

    /**
     * @notice Get all events a user has registered for
     * @param user The user address
     * @return uint256[] Array of event IDs
     */
    function getUserEvents(address user) public view returns (uint256[] memory) {
        return userEvents[user];
    }

    /**
     * @notice Check if a user is registered for an event
     * @param eventId The event ID
     * @param user The user address
     * @return bool True if registered
     */
    function isRegistered(uint256 eventId, address user) public view returns (bool) {
        return registrations[eventId][user].attendee != address(0);
    }

    /**
     * @notice Check if a user has checked in to an event
     * @param eventId The event ID
     * @param user The user address
     * @return bool True if checked in
     */
    function isCheckedIn(uint256 eventId, address user) public view returns (bool) {
        return registrations[eventId][user].checkedIn;
    }

    /**
     * @notice Update event metadata
     * @param eventId The event ID
     * @param metadataURI New metadata URI
     */
    function updateEvent(uint256 eventId, string memory metadataURI) public {
        require(events[eventId].organizer == msg.sender, "Not event organizer");
        events[eventId].metadataURI = metadataURI;

        emit EventUpdated(eventId);
    }

    /**
     * @notice Cancel an event
     * @param eventId The event ID
     */
    function cancelEvent(uint256 eventId) public {
        require(events[eventId].organizer == msg.sender, "Not event organizer");
        events[eventId].isActive = false;

        emit EventCancelled(eventId);
    }

    /**
     * @notice Helper to check if user has a profile
     */
    function hasProfile(address user) internal view returns (bool) {
        try IERC721(profileContract).balanceOf(user) returns (uint256 balance) {
            return balance > 0;
        } catch {
            return false;
        }
    }

    /**
     * @notice Update profile contract address (admin only)
     * @param _profileContract New profile contract address
     */
    function setProfileContract(address _profileContract) public onlyOwner {
        profileContract = _profileContract;
    }
}
