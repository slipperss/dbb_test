# DBB-test task
## Implemented:

## - Authorization, registration of employees
## - Calculation of the final salary of an employee from a request
## - Calculation of the final salary of an employee by id
## - Calculation of the sum of the final salaries of all employees in the company (application)

## - When calculating, a comparison with the now() date is used to calculate the number of years an employee spent in the company
## - The employee table is connected to the employee type table, types (Employee, Manager, Sales) are created, the employee type table stores percentage bonuses for the salaries of subordinates, years spent in the company and the maximum percentage of bonuses from salary, which gives dynamism
## - The salary takes into account all percentages for each type of employee + bonuses for the percentage of the sum of the final salaries of subordinates (all levels)
## - All basic calculations are made in raw sql queries and are as close as possible optimized for production
## - The main logic is covered by unit tests

## In sql queries, a recursive approach is used for any nesting of subordinates for the correct calculation of salaries.

## Cons of this approach:
## Performance: A recursive query can be very resource intensive, especially if it operates on a large amount of data or has deep recursion.

## Limitations: Not all DBMSs support recursive queries, and those that do may have limits on recursion depth or data volume.

## Incompatibility: The syntax and usage of recursive queries may differ between RDBMS, making them less portable across different platforms.

## The need to use transactions: A recursive query can lock a table, requiring the use of transactions to avoid data errors.

## The project uses sqlite. In production, it's better to use another database for this (postgres, mysql)


## To Run Project:

### 1) git clone https://github.com/slipperss/dbb-test.git
### 2) create .env file by example
### 3) npm ci - установка зависимостей проэкта
### 4) npm run test && npm run start
### 5) 127.0.0.1/docs - swagger docs for comfortable checking
### 6) database with test data provided db_sqlite
