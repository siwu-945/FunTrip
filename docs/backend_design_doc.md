## Room Data Structure Design

### Problem Statement
We need a robust data structure to manage active rooms in our Socket.IO backend. Each room must store the following:

1. Room Identifier: A unique room ID.
2. Host Information: Who is hosting the room.
3. User List: A collection of users in the room, where each user has attributes:
    1. socket.id
    1. username

### Requirements & Constraints
- Unique Room Identification: Each active room should have a unique identifier to prevent conflicts.

- Efficient Lookup & Updates: The chosen data structure should allow for quick access and modifications (e.g., adding or removing users, updating host details).

- Simplicity: The implementation should be straightforward to reduce the chance of bugs and improve maintainability.
- Scalability: The solution should handle an increasing number of rooms without significant performance degradation. 

### Design Options Considered
#### Option 1: HashMap with Room ID as Key
Structure:
Use a TypeScript record or Map where:
- Key: Room ID (a unique string).
- Value: A room information object containing:
    1. Room id 
    2. A list of users currently in the room.
        - Where each user has the following attribute:
            - ID
            - Socket.ID
    3. Id of the host of the room
    4. Optional: Password to enter the room


#### Pros
- Unique & Immutable Key: Using a primitive (room ID) guarantees uniqueness and simplifies key comparison.
- Direct Lookup: Quickly access room data via the room ID.
#### Cons:
- Requires managing nested data (e.g., ensuring user lists are updated atomically), but this is manageable with clear APIs.

#### Option 2: HashMap with Room Object as Key
Structure:
Use the room object itself as the key, with the value being the list of users.

#### Pros:
Direct association of room details with its user list.
#### Cons:
- Object Comparison Complexity: Using objects as keys can lead to issues with reference equality, making lookups less straightforward.

### Decision
After considering both options, Option 1 is the preferred approach for the following reasons:

Simplicity & Reliability & Efficient Lookup

### Future Enhancements & Open Questions
Scalability:

1. Determine if additional room properties (e.g., room status, creation timestamp) need to be stored, and plan how to integrate them without complicating the data structure.
2. Concurrency:
Address potential concurrency issues if multiple updates occur simultaneously, especially in a distributed environment.

