import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { FindOneOptions, Repository } from 'typeorm'

import { Staff, StaffType, StaffTypeNames } from './staff.entity'
import { CreateStaffMemberDto } from './dto/create-staff.dto'
import { AddSupervisorDto } from './dto/add-supervisor.dto'

@Injectable()
export class StaffService {
	constructor(
		@InjectRepository(Staff) private staffRepository: Repository<Staff>,
		@InjectRepository(StaffType)
		private staffTypeRepository: Repository<StaffType>,
	) {}

	async countStaffMemberSalaryById(id: number) {
		/*
			Returns an employee with his final salary: (Bonuses for the number of years in the company are taken into account +
			a percentage of the total final salary of all subordinates, if any)
		 */
		const staff = await this.staffRepository.findOne({ where: { id } })

		if (!staff) {
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
		}

		const query = `
				WITH RECURSIVE subordinates AS 
				    (SELECT id, baseSalary, 0 AS total_salary
					FROM staff
					WHERE id = :id

					UNION ALL

					SELECT s.id,
						   s.baseSalary,
						   total_salary + s.baseSalary AS total_salary
					FROM staff s
					JOIN subordinates sub ON s.supervisorId = sub.id
					JOIN staff_type t ON s.typeId = t.id)
				SELECT s.id,
					   s.name,
					   s.baseSalary,
					   s.supervisorId,
					   s.joinedAt,
					   CAST(s.baseSalary *
					   (1 + MIN(strftime('%Y', 'now') - strftime('%Y', joinedAt),
								t.maxPercentFromBaseSalary / t.perYearBonus) * t.perYearBonus) AS REAL)
					   + (SELECT SUM(CAST(sub.total_salary * perSubordinateBonus AS REAL))
						  FROM subordinates sub)
					   AS final_salary
				FROM staff s
						 JOIN staff_type t ON s.typeId = t.id
				WHERE s.id = :id LIMIT 1;`

		return await this.staffRepository.query(query, [id])
	}

	async getSumSalaryOfAllStaff() {
		/*
			Returns the sum of the final salaries of all employees
			(calculation algorithm as in -> countStaffMemberSalaryById, changed to calculate the total salary)
		 */
		const query = `
            WITH RECURSIVE subordinates AS 
                (SELECT id, baseSalary, 0 AS total_salary
				 FROM staff

				 UNION ALL

				 SELECT s.id,
				  	    s.baseSalary,
					    total_salary + s.baseSalary AS total_salary
				 FROM staff s
				 JOIN subordinates sub ON s.supervisorId = sub.id
				 JOIN staff_type t ON s.typeId = t.id)
            
            SELECT SUM(CAST(s.baseSalary * (1 + MIN(strftime('%Y', 'now') - strftime('%Y', joinedAt),
                                               t.maxPercentFromBaseSalary / t.perYearBonus) * t.perYearBonus) AS REAL))
		    + (SELECT SUM(CAST(sub.total_salary * perSubordinateBonus AS REAL)) 
			   FROM subordinates sub)
		    AS final_salary
            FROM staff s
            JOIN staff_type t ON s.typeId = t.id
        `
		return await this.staffRepository.query(query)
	}

	async getStaffMember(options: FindOneOptions<Staff>) {
		// Returns one StaffMember by options
		return await this.staffRepository.findOne(options)
	}

	async createStaffMember(dto: CreateStaffMemberDto) {
		/*
			Creates an employee with the type specified in dto,
			or the default employee type. It is assumed that
			all types of employees are entered into the database
		*/

		const staff = await this.staffRepository.create(dto)
		const staffType = await this.staffTypeRepository.findOneBy({
			name: dto.staffTypeName,
		})

		if (!staffType) {
			throw new HttpException(
				'Staff Type with given credentials not found',
				HttpStatus.NOT_FOUND,
			)
		}
		staff.type = staffType
		return await this.staffRepository.save(staff)
	}

	async addSupervisorToStaffMember(id: number, dto: AddSupervisorDto) {

		/*
			Adds a boss to the specified employee,
			with the condition that the boss can have employees (Manager, Sales),
			the employee does not yet have a boss and
			the employee is not the boss of the specified boss
		*/

		const staff = await this.getStaffMember({
			where: { id },
			relations: { type: true, supervisor: true },
		})

		const supervisor = await this.getStaffMember({
			where: { id: dto.supervisorId },
			relations: { type: true, supervisor: true },
		})

		if (!staff || !supervisor) {
			throw new HttpException(
				'Not found staff member with given credentials',
				HttpStatus.NOT_FOUND,
			)
		}

		if (staff.supervisor) {
			throw new HttpException(
				'This Staff Member already has a supervisor',
				HttpStatus.NOT_FOUND,
			)
		}

		if (
			supervisor.type.name !== StaffTypeNames.SALES &&
			supervisor.type.name !== StaffTypeNames.MANAGER
		) {
			throw new HttpException(
				"Given Supervisor can't have a subordinates",
				HttpStatus.FORBIDDEN,
			)
		}

		if (supervisor.supervisor === staff) {
			throw new HttpException(
				"A supervisor can't be a subordinate of his subordinate",
				HttpStatus.FORBIDDEN,
			)
		}

		staff.supervisor = supervisor

		return await this.staffRepository.save(staff)
	}
}
