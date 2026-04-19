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

export const DisplayClassTypeSchema = z.enum(['theory', 'practice', 'exercise']);

export const DisplayClassSchema = z.object({
  id: z.string(),                               // UUID sinh ra cho DisplayClass
  originalSubjectId: z.string(),                // Mã môn học gốc
  originalClassId: z.string(),                  // ID định danh lớp (vd: className hoặc mã lớp)
  type: DisplayClassTypeSchema,                 // Loại lớp
  subjectName: z.string(),                      // Tên môn học
  className: z.string(),                        // Tên lớp/nhóm
  location: z.string(),                         // Địa điểm
  schedules: z.array(ScheduleSchema),           // Lịch học
});

// 1. Ghi chú và Điểm danh từng buổi (Session Records)
export const ClassSessionRecordSchema = z.object({
  id: z.string().uuid(),
  displayClassId: z.string(),                   // Liên kết tới DisplayClass
  date: z.string().datetime(),                  // Ngày diễn ra buổi học
  noteContent: z.string().optional(),           // Nội dung ghi chú (Markdown)
  bonusPoints: z.number().int().default(0),     // Điểm cộng trong buổi
  isAbsent: z.boolean().default(false),         // Đánh vắng trong buổi
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// 2. Thành phần điểm (Ví dụ: Chuyên cần 10%, Giữa kỳ 30%, ...)
export const GradeComponentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),                             // Tên cột điểm
  weight: z.number().min(0).max(100),           // Trọng số (phần trăm 0-100)
  scores: z.array(z.number().min(0).max(10)).optional().default([]),  // Các lần điểm nhập, mỗi điểm thang 10
});

// 3. Quản lý Điểm cho một môn học (Course Progress / GPA tracking)
export const CourseProgressSchema = z.object({
  classId: z.string(),                                    // Liên kết với lớp đang theo học
  gradeComponents: z.array(GradeComponentSchema),         // Các thành phần điểm giảng viên yêu cầu
});

// 4. Lịch học đã được chọn (Chứa classId và nhóm thực hành/bài tập được chọn)
export const SelectedClassSchema = z.object({
  classId: z.string(),
  selectedPracticeGroupId: z.string().optional(),
  selectedExerciseGroupId: z.string().optional(),
});

// Danh sách các lịch học cá nhân tạo thành 1 cấu hình lịch (Schedule Profile)
export const ScheduleProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),                             // Tên cấu hình (VD: "Lịch sáng", "Lịch tối ưu")
  selectedClasses: z.array(SelectedClassSchema),// Các lớp đã chọn
  isMain: z.boolean().default(false),           // Có phải là lịch chính đang dùng không?
});

// 5. Cấu trúc dùng để hiển thị Lịch học (Populated Data - Đã join dữ liệu lớp học)
export const PopulatedSelectedClassSchema = z.object({
  classInfo: ClassSchema,
  selectedPracticeGroup: SubClassSchema.optional(),
  selectedExerciseGroup: SubClassSchema.optional(),
});

export const PopulatedScheduleProfileSchema = z.object({
  id: z.string(),                               // ID của profile
  score: z.number().optional(),                 // Điểm đánh giá thuật toán trả về
  classes: z.array(PopulatedSelectedClassSchema),
  isMain: z.boolean().default(false),
});


// ==========================================
// XUẤT CÁC TYPE ĐỂ DÙNG TRONG TYPESCRIPT
// ==========================================

export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export type SubClass = z.infer<typeof SubClassSchema>;
export type Class = z.infer<typeof ClassSchema>;
export type ClassList = z.infer<typeof ClassListSchema>;

export type DisplayClassType = z.infer<typeof DisplayClassTypeSchema>;
export type DisplayClass = z.infer<typeof DisplayClassSchema>;
export type ClassSessionRecord = z.infer<typeof ClassSessionRecordSchema>;
export type GradeComponent = z.infer<typeof GradeComponentSchema>;
export type CourseProgress = z.infer<typeof CourseProgressSchema>;
export type SelectedClass = z.infer<typeof SelectedClassSchema>;
export type ScheduleProfile = z.infer<typeof ScheduleProfileSchema>;

export type PopulatedSelectedClass = z.infer<typeof PopulatedSelectedClassSchema>;
export type PopulatedScheduleProfile = z.infer<typeof PopulatedScheduleProfileSchema>;
