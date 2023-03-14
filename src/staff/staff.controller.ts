import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Param, Put,
	Request,
	SerializeOptions,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'
import {
	ApiBearerAuth, ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger'
import {StaffService} from "./staff.service";
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {StaffOutDto} from "./dto/staff-out.dto";
import TypeGuard from "../auth/guards/type.guard";
import {StaffTypeNames} from "./staff.entity";
import {AddSupervisorDto} from "./dto/add-supervisor.dto";


@ApiTags('staff')
@Controller('api/staff/')
export class StaffController {
	constructor(private staffService: StaffService) {}

	@ApiOperation({ summary: 'Get Request Staff Member Info' })
	@ApiResponse({ status: 200, type: StaffOutDto })
	@ApiBearerAuth()
	@UseInterceptors(ClassSerializerInterceptor)
	@SerializeOptions({ type: StaffOutDto })
	@UseGuards(JwtAuthGuard)
	@Get('me/')
	async getStaffMemberMeInfo(@Request() req) {
		return await this.staffService.countStaffMemberSalaryById(req.user.id)
	}

	@ApiOperation({ summary: 'Get All Staff Sum Salary' })
	@ApiResponse({ status: 200 , schema: {example: {final_salary: 2000}}})
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get('all-staff-sum-salary')
	async getAllStaffSumSalary() {
		return await this.staffService.getSumSalaryOfAllStaff()
	}

	@ApiOperation({ summary: 'Get Staff Member Salary By Id' })
	@ApiResponse({ status: 200, type: StaffOutDto })
	@ApiParam({
		name: 'id',
		type: Number,
		required: true,
		example: 1,
		description: 'Staff Member Id',
	})
	@UseInterceptors(ClassSerializerInterceptor)
	@SerializeOptions({ type: StaffOutDto })
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get(':id/salary')
	async getStaffMemberSalaryById(@Param('id') id: number, @Request() req) {
		return await this.staffService.countStaffMemberSalaryById(id)
	}

	@ApiOperation({ summary: 'Add Supervisor To Staff Member By Id' })
	@ApiResponse({ status: 200, schema: { example: { result: true } } })
	@ApiBearerAuth()
	@ApiParam({
		name: 'id',
		type: Number,
		required: true,
		example: 1,
		description: 'Staff Member Id',
	})
	@ApiBody({type: AddSupervisorDto})
	@UseGuards(TypeGuard([StaffTypeNames.MANAGER || StaffTypeNames.SALES]))
	@UseGuards(JwtAuthGuard)
	@Put(':id/add-supervisor')
	async addSupervisorToStaffMember(@Param('id') id, @Body() dto: AddSupervisorDto) {
		return await this.staffService.addSupervisorToStaffMember(id, dto)
	}
}
