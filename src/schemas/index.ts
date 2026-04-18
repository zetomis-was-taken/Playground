import { z } from 'zod';

// ==========================================
// SCHEMA CHO DỮ LIỆU ĐẦU VÀO (DANH SÁCH LỚP)
// ==========================================

// Enum ngày trong tuần
export const DayOfWeekSchema = z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);

// Lịch học cơ bản
export const ScheduleSchema = z.object({
  dayOfWeek: DayOfWeekSchema,
  startPeriod: z.number().int().min(1).max(15), // Tiết bắt đầu
  endPeriod: z.number().int().min(1).max(15),   // Tiết kết thúc
  location: z.string(),                         // Địa điểm
});

// Nhóm thực hành hoặc bài tập
export const SubClassSchema = z.object({
  groupId: z.string(),                          // Nhóm (mã nhóm)
  capacity: z.number().int().positive(),        // Sĩ số
  enrolled: z.number().int().nonnegative(),     // Đã đăng ký
  location: z.string(),                         // Địa điểm (nếu có khác với lịch học)
  schedules: z.array(ScheduleSchema),           // Lịch học của nhóm
});

// Lớp học chính
export const ClassSchema = z.object({
  subjectId: z.string(),                        // Mã môn học
  subjectName: z.string(),                      // Tên môn học
  className: z.string(),                        // Tên lớp
  credits: z.number().int().positive(),         // Số tín chỉ
  capacity: z.number().int().positive(),        // Sĩ số tối đa
  enrolled: z.number().int().nonnegative(),     // Đã đăng kí hiện tại
  cohort: z.number().int().positive(),          // Khóa (vd: 2024, 2025)
  schedules: z.array(ScheduleSchema),           // Lịch học chính (lý thuyết)
  location: z.string().optional(),              // Địa điểm chung (nếu ghi chú ở cấp lớp)
  practiceGroups: z.array(SubClassSchema).optional(), // Nhóm thực hành (có hoặc không)
  exerciseGroups: z.array(SubClassSchema).optional(), // Nhóm bài tập (có hoặc không)
});

// Schema cho danh sách các lớp trả về từ JSON (để parse trực tiếp file JSON)
export const ClassListSchema = z.array(ClassSchema);


// ==========================================
// CÁC SCHEMA PHỤC VỤ TÍNH NĂNG ỨNG DỤNG
// ==========================================

// 1. Ghi chú bài giảng (Notes)
export const NoteSchema = z.object({
  id: z.uuid(),
  classId: z.string(),                          // Liên kết tới lớp học/môn học
  title: z.string().optional(),                 // Tiêu đề ghi chú (có thể để trống)
  content: z.string(),                          // Nội dung ghi chú
  createdAt: z.iso.datetime(),             // Thời gian tạo (ISO string)
  updatedAt: z.iso.datetime(),             // Thời gian cập nhật (ISO string)
});

// 2. Thành phần điểm (Ví dụ: Chuyên cần 10%, Giữa kỳ 30%, ...)
export const GradeComponentSchema = z.object({
  id: z.uuid(),
  name: z.string(),                             // Tên cột điểm
  weight: z.number().min(0).max(100),           // Trọng số (phần trăm 0-100)
  score: z.number().min(0).max(10).optional(),  // Điểm đạt được (thang 10)
});

// 3. Quản lý Điểm và Điểm danh cho một môn học (Course Progress / GPA tracking)
export const CourseProgressSchema = z.object({
  classId: z.string(),                                    // Liên kết với lớp đang theo học
  gradeComponents: z.array(GradeComponentSchema),         // Các thành phần điểm giảng viên yêu cầu
  bonusPoints: z.number().int().nonnegative().default(0), // Điểm cộng / Số lần phát biểu
  absences: z.number().int().nonnegative().default(0),    // Số buổi đã nghỉ (đánh vắng)
});

// 4. Lịch học đã được chọn (Chứa classId và nhóm thực hành/bài tập được chọn)
export const SelectedClassSchema = z.object({
  classId: z.string(),
  selectedPracticeGroupId: z.string().optional(),
  selectedExerciseGroupId: z.string().optional(),
});

// Danh sách các lịch học cá nhân tạo thành 1 cấu hình lịch (Schedule Profile)
export const ScheduleProfileSchema = z.object({
  id: z.uuid(),
  name: z.string(),                             // Tên cấu hình (VD: "Lịch sáng", "Lịch tối ưu")
  selectedClasses: z.array(SelectedClassSchema),// Các lớp đã chọn
  isMain: z.boolean().default(false),           // Có phải là lịch chính đang dùng không?
});


// ==========================================
// XUẤT CÁC TYPE ĐỂ DÙNG TRONG TYPESCRIPT
// ==========================================

export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type SubClass = z.infer<typeof SubClassSchema>;
export type Class = z.infer<typeof ClassSchema>;
export type ClassList = z.infer<typeof ClassListSchema>;

export type Note = z.infer<typeof NoteSchema>;
export type GradeComponent = z.infer<typeof GradeComponentSchema>;
export type CourseProgress = z.infer<typeof CourseProgressSchema>;
export type SelectedClass = z.infer<typeof SelectedClassSchema>;
export type ScheduleProfile = z.infer<typeof ScheduleProfileSchema>;
