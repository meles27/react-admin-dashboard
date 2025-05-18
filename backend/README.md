# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command
   "# typescript-server-starter"
   "# typescript-server-starter"
   "# typescript-server-starter"
   "# typescript-server-starter"
   "# typescript-server-starter"

<!-- return sale process -->

+-----------+
| pending | <-- initial state when return is requested
+-----------+
|
| Approve request
v
+-----------+
| approved | <-- waiting for refund or restocking
+-----------+
/ \
 / \ Reject
v v
refunded rejected
|
v
restocked
|
v
completed

<!-- second view -->

You can also go:

pending → rejected

approved → refunded

approved → restocked

refunded → restocked → completed
