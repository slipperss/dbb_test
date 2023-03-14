import { ApiProperty } from '@nestjs/swagger'
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm'

export enum StaffTypeNames {
	/* 
	   Already Created Staff Types In Database
	   This Enum was created for comfortable using in controllers and validators
	   Can be modified in future if need
	*/
	EMPLOYEE = 'employee',
	MANAGER = 'manager',
	SALES = 'sales',
}

@Entity('staff_type')
export class StaffType {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@OneToMany(() => Staff, (staff) => staff.type)
	staffMembers

	@Column({ type: 'float', nullable: false })
	perYearBonus: number

	@Column({ type: 'float', default: 0 })
	perSubordinateBonus: number

	@Column({ type: 'float', nullable: false })
	maxPercentFromBaseSalary: number
}

@Entity('staff')
export class Staff {
	constructor(partial: Partial<Staff>) {
		Object.assign(this, partial)
	}

	@ApiProperty({ example: '1', description: 'Unique Identifier' })
	@PrimaryGeneratedColumn()
	id: number

	@ApiProperty({ example: 'megatron123', description: 'Name' })
	@Column({ nullable: false, unique: true })
	name: string

	@ApiProperty({ example: 'example@gmail.com', description: 'Email Address' })
	@Column({ nullable: false, unique: true })
	email: string

	@Column({ nullable: false, select: false })
	password: string

	@ApiProperty({
		example: '2022-11-16',
		description: 'Joined Date',
	})
	@CreateDateColumn({ type: 'datetime' })
	joinedAt: Date

	@ApiProperty({ type: () => StaffType, description: 'Type of Staff' })
	@ManyToOne(() => StaffType, (type) => type.staffMembers)
	type: StaffType

	@ApiProperty({
		example: '1000',
		description: 'Salary',
	})
	@Column({ default: 1000 })
	baseSalary: number

	@ApiProperty({ type: () => Staff, description: 'Chief' })
	@ManyToOne(() => Staff, (staff) => staff.subordinates)
	supervisor: Staff

	@ApiProperty({ type: () => [Staff], description: 'Subordinates' })
	@OneToMany(() => Staff, (staff) => staff.supervisor)
	subordinates: Staff[]
}
