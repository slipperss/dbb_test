import { ApiProperty } from '@nestjs/swagger'

import { Staff } from '../staff.entity'

export class StaffOutDto extends Staff {
	@ApiProperty({
		example: '2000',
		description: 'Staff Member Salary With All Bonuses',
	})
	final_salary: number
}
