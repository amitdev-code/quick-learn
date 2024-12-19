import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@src/common/dto';
import { en } from '@src/lang/en';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '@src/common/decorators/current-user.decorators';
import { UserEntity } from '@src/entities';
import { PaginationDto } from '../users/dto';
import { CourseArchiveDto } from '../course/dto/course-archive.dto';
import { LessonEmailService } from './lesson-email-cron.service';

@ApiTags('Lessons')
@Controller({
  path: 'lesson',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class LessonController {
  constructor(
    private readonly service: LessonService,
    private readonly LessonEmailService: LessonEmailService,
  ) {}

  @ApiOperation({ summary: 'Get all the lessons.' })
  @Get()
  /**
   * Retrieves all lessons.
   * @returns A list of lessons.
   */
  async FETCH_LESSONS(): Promise<SuccessResponse> {
    const lessons = await this.service.getMany();
    return new SuccessResponse(en.FETCH_LESSONS, lessons);
  }

  @ApiOperation({ summary: 'Get all unapproved the lessons.' })
  @Get('unapproved')
  /**
   * Retrieves all unapproved lessons.
   * @returns A list of lessons.
   */
  async getUnapprovedLessons(): Promise<SuccessResponse> {
    const lessons = await this.service.getUnapprovedLessons();
    return new SuccessResponse(en.FETCH_LESSONS, lessons);
  }

  @ApiOperation({ summary: 'Create a new lesson.' })
  @Post()
  /**
   * Creates a new lesson.
   * @param user The user creating the lesson.
   * @param createLessonDto The data for creating the lesson.
   * @returns A promise that resolves to a success response.
   */
  async create(
    @CurrentUser() user: UserEntity,
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<SuccessResponse> {
    await this.service.CREATE_LESSONS(user, createLessonDto);
    return new SuccessResponse(en.CREATE_LESSONS);
  }

  @ApiOperation({ summary: 'Get a specific lesson.' })
  @Get('/:id')
  /**
   * Retrieves a specific lesson by its id.
   * @param id The id of the lesson that needs to be retrieved.
   * @throws BadRequestException if the lesson doesn't exist
   * @returns A promise that resolves to a success response containing the lesson entity.
   */
  async get(
    @Param('id') id: string,
    @Query('approved') approved: string,
  ): Promise<SuccessResponse> {
    const lesson = await this.service.get(
      { id: +id, approved: approved == 'true' },
      ['created_by_user', 'course'],
    );
    if (!lesson) {
      throw new BadRequestException(en.LESSON_NOT_FOUND);
    }
    return new SuccessResponse(en.FETCH_LESSON, lesson);
  }

  @ApiOperation({ summary: 'Update an existing lesson.' })
  @Patch('/:id')
  /**
   * Updates an existing lesson.
   * @param id The id of the lesson that needs to be updated.
   * @param updateLessonDto The data for updating the lesson.
   * @throws BadRequestException if the lesson doesn't exist
   * @returns A promise that resolves to a success response.
   */
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: UserEntity,
  ): Promise<SuccessResponse> {
    await this.service.UPDATE_LESSON(user, +id, updateLessonDto);
    return new SuccessResponse(en.UPDATE_LESSON);
  }

  @ApiOperation({ summary: 'Approved an lessons.' })
  @Patch('/:id/approve')
  /**
   * Approves an existing lesson.
   * @param id The id of the lesson that needs to be approved.
   * @param user The user approving the lesson.
   * @throws BadRequestException if the lesson doesn't exist
   * @returns A promise that resolves to a success response.
   */
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<SuccessResponse> {
    await this.service.APPROVED_LESSON(+id, user.id);
    return new SuccessResponse(en.APPROVED_LESSON);
  }

  @ApiOperation({ summary: 'Archive an lessons.' })
  @Patch('/:id/archive')
  /**
   * Archives an existing lesson.
   * @param id The id of the lesson that needs to be archived.
   * @param user The user archiving the lesson.
   * @throws BadRequestException if the lesson doesn't exist
   * @returns A promise that resolves to a success response.
   */
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<SuccessResponse> {
    await this.service.ARCHIVE_LESSON(+id, user.id);
    return new SuccessResponse(en.ARCHIVE_LESSON);
  }

  @ApiOperation({ summary: 'Get all archived lessons.' })
  @Post('archived')
  async findAllArchivedLessons(
    @CurrentUser() user: UserEntity,
    @Body() paginationDto: PaginationDto,
  ): Promise<SuccessResponse> {
    const lessons = await this.service.FETCH_ARCHIVE_LESSONS(paginationDto, [
      'course',
      'created_by_user',
      'archive_by_user',
      'approved_by_user',
    ]);
    return new SuccessResponse(en.FETCH_LESSONS, lessons);
  }

  @ApiOperation({ summary: 'Activate or deactivate a lesson.' })
  @Post('activate')
  async activateLesson(
    @Body() body: CourseArchiveDto,
    @CurrentUser() user: UserEntity,
  ): Promise<SuccessResponse> {
    if (!body.active) {
      await this.service.ARCHIVE_LESSON(user.id, body.id);
      return new SuccessResponse(en.ARCHIVE_LESSON);
    }

    await this.service.UNARCHIVE_LESSON(body.id);
    return new SuccessResponse(en.UNARCHIVE_LESSON);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete a lesson' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the lesson to delete',
    required: true,
  })
  async deleteLesson(@Param('id') id: string): Promise<SuccessResponse> {
    await this.service.deleteLesson(+id);
    return new SuccessResponse(en.LESSON_DELETED);
  }

  /**
   *
   * @param user current user id
   * @param lessonId lesson id
   * @param courseId course id
   * @param token validatation token sent on mail
   * @returns lesson details
   */

  @Get(':lessonId/:courseId/:token')
  @ApiOperation({ summary: "Get current user's lesson by id and course id" })
  @ApiParam({
    name: 'lessonId',
    required: true,
    type: String,
    description: 'Get the lesson by id',
  })
  @ApiParam({
    name: 'courseId',
    required: true,
    type: String,
    description: 'Get lesson by course id',
  })
  @ApiParam({
    name: 'token',
    required: true,
    type: String,
    description: 'validate lesson url using token',
  })
  async getCurrentUserLessonsByIdAndCourseId(
    @CurrentUser() user: UserEntity,
    @Param('lessonId') lessonId: string,
    @Param('courseId') courseId: string,
    @Param('token') token: string,
  ): Promise<SuccessResponse> {
    await this.service.validateLessionToken(
      token,
      +user.id,
      +courseId,
      +lessonId,
    );
    const lessonDetail = await this.service.fetchLesson(+lessonId, +courseId);

    await this.service.updateDailyLessonToken(
      token,
      +user.id,
      +courseId,
      +lessonId,
    );

    return new SuccessResponse(en.LESSON_FOR_THE_DAY, lessonDetail);
  }
}
