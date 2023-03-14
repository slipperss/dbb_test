import { Test } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Staff, StaffType } from '../staff.entity'
import { StaffService } from '../staff.service'
import { HttpException } from '@nestjs/common'
import {StaffOutDto} from "../dto/staff-out.dto";

describe('StaffService', () => {
	let service: StaffService
	let repoStaff: Repository<Staff>
	let repoType: Repository<StaffType>

	const staffType1 = new StaffType()
	staffType1.name = 'employee'
	staffType1.perYearBonus = 0.03
	staffType1.maxPercentFromBaseSalary = 0.3
	staffType1.perSubordinateBonus = 0

	const staffType2 = new StaffType()
	staffType2.name = 'sales'
	staffType2.perYearBonus = 0.01
	staffType2.maxPercentFromBaseSalary = 0.35
	staffType2.perSubordinateBonus = 0.003

	const staffType3 = new StaffType()
	staffType3.name = 'manager'
	staffType3.perYearBonus = 0.05
	staffType3.maxPercentFromBaseSalary = 0.4
	staffType3.perSubordinateBonus = 0.005

	let staff1: Staff
	let staff2: Staff
	let staff3: Staff

	beforeAll(async () => {
		const module = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRoot({
					type: 'sqlite',
					database: ':memory:',
					entities: [Staff, StaffType],
					synchronize: true,
					//dropSchema: true,
					logging: false,
				}),
				TypeOrmModule.forFeature([Staff, StaffType]),
			],
			providers: [
				StaffService,
				{
					provide: getRepositoryToken(Staff),
					useClass: Repository,
				},
				{
					provide: getRepositoryToken(StaffType),
					useClass: Repository,
				},
			],
		}).compile()

		repoStaff = module.get<Repository<Staff>>(getRepositoryToken(Staff))
		repoType = module.get<Repository<StaffType>>(getRepositoryToken(StaffType))
		//service = module.get<StaffService>(StaffService)
		service = new StaffService(repoStaff, repoType)

		await repoType.save([staffType1, staffType2, staffType3])
	})

	beforeEach(async () => {
		staff1 = repoStaff.create()
		staff1.id = 1
		staff1.baseSalary = 1000
		staff1.type = staffType1
		staff1.name = 'dimas'
		staff1.email = 'dimas@gmail.com'
		staff1.password = 'test_password'

		staff2 = repoStaff.create()
		staff2.id = 2
		staff2.baseSalary = 1000
		staff2.type = staffType2
		staff2.name = 'anton'
		staff2.email = 'anton@gmail.com'
		staff2.password = 'test_password'
		staff2.joinedAt = new Date('2017-03-13 14:21:40')

		staff3 = repoStaff.create()
		staff3.id = 3
		staff3.baseSalary = 1000
		staff3.type = staffType3
		staff3.name = 'valera'
		staff3.email = 'valera@gmail.com'
		staff3.password = 'test_password'
		staff3.joinedAt = new Date('2018-03-13 14:21:40')
		//staff3.subordinates = [staff1, staff2]

		await repoStaff.save([staff1, staff2, staff3])
	})

	afterEach(async () => {
		await repoStaff.clear()
	})

	describe('createStaffMember', () => {
		it('should return correct created staff member', async () => {
			const newStaffDto = {
				staffTypeName: 'sales',
				name: 'test',
				email: 'test@gmail.com',
				baseSalary: 1000,
			}
			const res = await service.createStaffMember({...newStaffDto, password: '123'})

			const toCompare = {
				name: res.name,
				staffTypeName: res.type.name,
				email: res.email,
				baseSalary: res.baseSalary,
			}

			expect(toCompare).toEqual(new StaffOutDto(newStaffDto)) // base salary + bonus for years
		})
	})

	describe('countStaffMemberSalaryById', () => {
		it('should return correct salary amount for staff member', async () => {
			const salaryAmount = await service.countStaffMemberSalaryById(staff2.id)

			expect(salaryAmount[0].final_salary).toEqual(1060) // base salary + bonus for years
			// 1260 = 1000 * (1 +(2023 - 2017) * 0.05)
		})
		it('should return correct salary amount for manager with subordinates', async () => {
			const mem = await repoStaff.findOne({
				where: { id: staff3.id },
				relations: { subordinates: true },
			})

			mem.subordinates = [staff1, staff2]

			await repoStaff.save(mem)

			const salaryAmount = await service.countStaffMemberSalaryById(staff3.id)

			expect(salaryAmount[0].final_salary).toEqual(1260) // base salary + bonus for years + subordinates
			// 1260 = 1000 * (1 +(2023 - 2018) * 0.05) + 2000 * 0.005
		})

		it('should throw an error for non-existent staff member', async () => {
			await expect(
				service.countStaffMemberSalaryById(56775),
			).rejects.toThrowError(HttpException)
		})
	})

	describe('getSumSalaryOfAllStaff', () => {
		it('should return correct sum of all staff salaries', async () => {
			const sumSalary = await service.getSumSalaryOfAllStaff()

			expect(sumSalary[0].final_salary).toEqual(3310) // sum of all salaries
			// 1250 = 1000 * (1 + (2023 - 2018) * 0.05)
			// 1060 = 1000 * (1 + (2023 - 2017) * 0.01)
			// 1000 = 1000 * (1 + (2023 - 2023) * 0.03)
		})
	})

	describe('addSupervisorToStaffMember', () => {
		it('should return staff member with supervisor', async () => {
			const res = await service.addSupervisorToStaffMember(staff2.id, {
				supervisorId: staff3.id,
			})

			expect(res.supervisor.id).toEqual(staff3.id)
		})

		it('should throw an error for A supervisor must be a manager or sales', async () => {
			const res = service.addSupervisorToStaffMember(staff2.id, {
				supervisorId: staff1.id,
			})

			await expect(res).rejects.toThrowError(HttpException)
		})
	})
})
