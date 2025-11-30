using HiHSK.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HiHSK.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // ============ COURSE & LESSON ENTITIES ============
    public DbSet<CourseCategory> CourseCategories { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<LessonTopic> LessonTopics { get; set; }
    public DbSet<LessonExercise> LessonExercises { get; set; }

    // ============ VOCABULARY ENTITIES ============
    public DbSet<Word> Words { get; set; }
    public DbSet<VocabularyTopic> VocabularyTopics { get; set; }
    public DbSet<WordVocabularyTopic> WordVocabularyTopics { get; set; }

    // ============ RADICAL ENTITIES ============
    public DbSet<Radical> Radicals { get; set; }
    public DbSet<WordRadical> WordRadicals { get; set; }

    // ============ DIALOGUE ENTITIES ============
    public DbSet<Dialogue> Dialogues { get; set; }
    public DbSet<DialogueSentence> DialogueSentences { get; set; }

    // ============ READING ENTITIES ============
    public DbSet<ReadingPassage> ReadingPassages { get; set; }
    public DbSet<ReadingPassageWord> ReadingPassageWords { get; set; }

    // ============ QUESTION & EXAM ENTITIES ============
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionOption> QuestionOptions { get; set; }
    public DbSet<ExamPaper> ExamPapers { get; set; }
    public DbSet<ExamPaperQuestion> ExamPaperQuestions { get; set; }

    // ============ SENTENCE PATTERN ENTITIES ============
    public DbSet<SentencePattern> SentencePatterns { get; set; }
    public DbSet<SentencePatternExample> SentencePatternExamples { get; set; }

    // ============ MEASURE WORD ENTITIES ============
    public DbSet<MeasureWord> MeasureWords { get; set; }
    public DbSet<MeasureWordExample> MeasureWordExamples { get; set; }
    public DbSet<WordMeasureWord> WordMeasureWords { get; set; }

    // ============ WORD EXAMPLE ENTITIES ============
    public DbSet<WordExample> WordExamples { get; set; }

    // ============ WRITING ENTITIES ============
    public DbSet<WritingExercise> WritingExercises { get; set; }

    // ============ TRANSLATION ENTITIES ============
    public DbSet<TranslationHistory> TranslationHistories { get; set; }

    // ============ USER PROGRESS ENTITIES ============
    public DbSet<UserLessonProgress> UserLessonProgresses { get; set; }
    public DbSet<UserAnswer> UserAnswers { get; set; }
    public DbSet<UserWordProgress> UserWordProgresses { get; set; }
    public DbSet<UserLessonStatus> UserLessonStatuses { get; set; }
    public DbSet<UserCourseStatus> UserCourseStatuses { get; set; }
    public DbSet<UserDialogueProgress> UserDialogueProgresses { get; set; }
    public DbSet<UserActivityProgress> UserActivityProgresses { get; set; }
    public DbSet<UserReadingProgress> UserReadingProgresses { get; set; }
    public DbSet<UserReadingWordMark> UserReadingWordMarks { get; set; }
    public DbSet<UserRadicalProgress> UserRadicalProgresses { get; set; }
    public DbSet<UserWritingProgress> UserWritingProgresses { get; set; }
    public DbSet<UserWritingAttempt> UserWritingAttempts { get; set; }

    // ============ PRONUNCIATION ENTITIES ============
    public DbSet<UserPronunciationAttempt> UserPronunciationAttempts { get; set; }

    // ============ FAVORITE ENTITIES ============
    public DbSet<FavoriteWord> FavoriteWords { get; set; }
    public DbSet<FavoriteSentencePattern> FavoriteSentencePatterns { get; set; }

    // ============ ANALYSIS & STATISTICS ENTITIES ============
    public DbSet<ExamResultAnalysis> ExamResultAnalyses { get; set; }
    public DbSet<Leaderboard> Leaderboards { get; set; }
    public DbSet<UserDailyStats> UserDailyStats { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // ============ COURSE CATEGORY ============
        builder.Entity<CourseCategory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.DisplayName)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // ============ COURSE ============
        builder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Level).HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Courses)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ============ LESSON ============
        builder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(250);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.LessonIndex).IsRequired();
            entity.Property(e => e.IsLocked)
                .IsRequired()
                .HasDefaultValue(true);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            entity.HasOne(e => e.Course)
                .WithMany(c => c.Lessons)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.PrerequisiteLesson)
                .WithMany(l => l.PrerequisiteForLessons)
                .HasForeignKey(e => e.PrerequisiteLessonId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(e => new { e.CourseId, e.LessonIndex });
            entity.HasIndex(e => e.PrerequisiteLessonId);
        });

        // ============ LESSON TOPIC ============
        builder.Entity<LessonTopic>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.TopicIndex).IsRequired();
            entity.Property(e => e.IsLocked)
                .IsRequired()
                .HasDefaultValue(true);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            entity.HasOne(e => e.Course)
                .WithMany()
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.PrerequisiteTopic)
                .WithMany(t => t.PrerequisiteForTopics)
                .HasForeignKey(e => e.PrerequisiteTopicId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasMany(e => e.Words)
                .WithOne(w => w.Topic)
                .HasForeignKey(w => w.TopicId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.HSKLevel, e.TopicIndex });
            entity.HasIndex(e => e.PrerequisiteTopicId);
        });

        // ============ LESSON EXERCISE ============
        builder.Entity<LessonExercise>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExerciseType)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ExerciseIndex).IsRequired();
            entity.Property(e => e.IsLocked)
                .IsRequired()
                .HasDefaultValue(true);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            entity.HasOne(e => e.Topic)
                .WithMany(t => t.Exercises)
                .HasForeignKey(e => e.TopicId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.PrerequisiteExercise)
                .WithMany(ex => ex.PrerequisiteForExercises)
                .HasForeignKey(e => e.PrerequisiteExerciseId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(e => new { e.TopicId, e.ExerciseIndex });
            entity.HasIndex(e => e.PrerequisiteExerciseId);
        });

        // ============ WORD ============
        builder.Entity<Word>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Character)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Pinyin)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.Meaning)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.ExampleSentence).HasMaxLength(500);
            entity.Property(e => e.PartOfSpeech).HasMaxLength(50);
            entity.Property(e => e.PartOfSpeechVi).HasMaxLength(50);
            entity.Property(e => e.PartOfSpeechEn).HasMaxLength(50);
            entity.Property(e => e.GrammarNote).HasMaxLength(1000);
            entity.Property(e => e.Structure).HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Topic)
                .WithMany(t => t.Words)
                .HasForeignKey(e => e.TopicId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.HSKLevel);
            entity.HasIndex(e => e.Character);
            entity.HasIndex(e => e.TopicId);
            entity.HasIndex(e => e.PartOfSpeech);
        });

        // ============ WORD EXAMPLE ============
        builder.Entity<WordExample>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Character)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.Pinyin)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.Meaning)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.SortOrder)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.Word)
                .WithMany(w => w.WordExamples)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.WordId);
        });

        // ============ VOCABULARY TOPIC ============
        builder.Entity<VocabularyTopic>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // ============ WORD VOCABULARY TOPIC (Many-to-Many) ============
        builder.Entity<WordVocabularyTopic>(entity =>
        {
            entity.HasKey(e => new { e.WordId, e.VocabularyTopicId });

            entity.HasOne(e => e.Word)
                .WithMany(w => w.WordVocabularyTopics)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.VocabularyTopic)
                .WithMany(vt => vt.WordVocabularyTopics)
                .HasForeignKey(e => e.VocabularyTopicId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ RADICAL ============
        builder.Entity<Radical>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Character)
                .IsRequired()
                .HasMaxLength(10);
            entity.HasIndex(e => e.Character).IsUnique();
            entity.Property(e => e.Pinyin)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Meaning)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
        });

        // ============ WORD RADICAL (Many-to-Many) ============
        builder.Entity<WordRadical>(entity =>
        {
            entity.HasKey(e => new { e.WordId, e.RadicalId });

            entity.HasOne(e => e.Word)
                .WithMany(w => w.WordRadicals)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Radical)
                .WithMany(r => r.WordRadicals)
                .HasForeignKey(e => e.RadicalId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ DIALOGUE ============
        builder.Entity<Dialogue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.DialogueText)
                .IsRequired();
            entity.Property(e => e.SceneDescription).HasMaxLength(500);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.DifficultyLevel)
                .IsRequired()
                .HasDefaultValue(1);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.Dialogues)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.SetNull);

            // ExerciseId relationship - Comment out nếu column chưa tồn tại trong database
            // entity.HasOne(e => e.Exercise)
            //     .WithMany(ex => ex.Dialogues)
            //     .HasForeignKey(e => e.ExerciseId)
            //     .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.LessonId);
            // entity.HasIndex(e => e.ExerciseId); // Comment out nếu column chưa tồn tại
            entity.HasIndex(e => e.DifficultyLevel);
            entity.HasIndex(e => e.Category);
        });

        // ============ DIALOGUE SENTENCE ============
        builder.Entity<DialogueSentence>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SentenceText)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.Pinyin).HasMaxLength(500);
            entity.Property(e => e.Translation).HasMaxLength(500);
            entity.Property(e => e.Speaker).HasMaxLength(100);
            entity.Property(e => e.SentenceIndex).IsRequired();

            entity.HasOne(e => e.Dialogue)
                .WithMany(d => d.DialogueSentences)
                .HasForeignKey(e => e.DialogueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ READING PASSAGE ============
        builder.Entity<ReadingPassage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.PassageText)
                .IsRequired();
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.DifficultyLevel)
                .IsRequired()
                .HasDefaultValue(1);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.ReadingPassages)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.SetNull);

            // ExerciseId relationship - Comment out nếu column chưa tồn tại trong database
            // entity.HasOne(e => e.Exercise)
            //     .WithMany(ex => ex.ReadingPassages)
            //     .HasForeignKey(e => e.ExerciseId)
            //     .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.LessonId);
            // entity.HasIndex(e => e.ExerciseId); // Comment out nếu column chưa tồn tại
            entity.HasIndex(e => e.DifficultyLevel);
        });

        // ============ READING PASSAGE WORD ============
        builder.Entity<ReadingPassageWord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PositionInText).IsRequired();
            entity.Property(e => e.Context).HasMaxLength(200);

            entity.HasOne(e => e.Passage)
                .WithMany(p => p.ReadingPassageWords)
                .HasForeignKey(e => e.PassageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Word)
                .WithMany(w => w.ReadingPassageWords)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ QUESTION ============
        builder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionText)
                .IsRequired();
            entity.Property(e => e.QuestionType)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("CHOOSE_MEANING");
            entity.Property(e => e.Points)
                .IsRequired()
                .HasDefaultValue(1);
            entity.Property(e => e.DifficultyLevel)
                .IsRequired()
                .HasDefaultValue(1);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.Questions)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ReadingPassage)
                .WithMany(r => r.Questions)
                .HasForeignKey(e => e.ReadingPassageId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Dialogue)
                .WithMany(d => d.Questions)
                .HasForeignKey(e => e.DialogueId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.SentencePattern)
                .WithMany(sp => sp.Questions)
                .HasForeignKey(e => e.SentencePatternId)
                .OnDelete(DeleteBehavior.SetNull);

            // ExerciseId relationship - Comment out nếu column chưa tồn tại trong database
            // entity.HasOne(e => e.Exercise)
            //     .WithMany(ex => ex.Questions)
            //     .HasForeignKey(e => e.ExerciseId)
            //     .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.LessonId);
            // entity.HasIndex(e => e.ExerciseId); // Comment out nếu column chưa tồn tại
            entity.HasIndex(e => e.QuestionType);
            entity.HasIndex(e => e.ReadingPassageId);
            entity.HasIndex(e => e.DialogueId);
            entity.HasIndex(e => e.SentencePatternId);
        });

        // ============ QUESTION OPTION ============
        builder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OptionText)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.OptionLabel)
                .IsRequired()
                .HasMaxLength(10);
            entity.Property(e => e.IsCorrect)
                .IsRequired()
                .HasDefaultValue(false);
            entity.Property(e => e.Explanation).HasMaxLength(500);

            entity.HasOne(e => e.Question)
                .WithMany(q => q.QuestionOptions)
                .HasForeignKey(e => e.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ EXAM PAPER ============
        builder.Entity<ExamPaper>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.ExamType)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.DurationMinutes).IsRequired();
            entity.Property(e => e.TotalQuestions)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.TotalPoints)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.PassingScore)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
        });

        // ============ EXAM PAPER QUESTION ============
        builder.Entity<ExamPaperQuestion>(entity =>
        {
            entity.HasKey(e => new { e.ExamPaperId, e.QuestionId });
            entity.Property(e => e.QuestionOrder).IsRequired();

            entity.HasOne(e => e.ExamPaper)
                .WithMany(ep => ep.ExamPaperQuestions)
                .HasForeignKey(e => e.ExamPaperId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Question)
                .WithMany(q => q.ExamPaperQuestions)
                .HasForeignKey(e => e.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ SENTENCE PATTERN ============
        builder.Entity<SentencePattern>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PatternText)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Pinyin).HasMaxLength(200);
            entity.Property(e => e.Meaning)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.Usage).HasMaxLength(1000);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.DifficultyLevel)
                .IsRequired()
                .HasDefaultValue(1);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.SentencePatterns)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.SetNull);

            // ExerciseId relationship - Comment out nếu column chưa tồn tại trong database
            // entity.HasOne(e => e.Exercise)
            //     .WithMany(ex => ex.SentencePatterns)
            //     .HasForeignKey(e => e.ExerciseId)
            //     .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.LessonId);
            // entity.HasIndex(e => e.ExerciseId); // Comment out nếu column chưa tồn tại
        });

        // ============ SENTENCE PATTERN EXAMPLE ============
        builder.Entity<SentencePatternExample>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExampleText)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.Pinyin).HasMaxLength(500);
            entity.Property(e => e.Translation)
                .IsRequired()
                .HasMaxLength(500);
            entity.Property(e => e.SortOrder)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.SentencePattern)
                .WithMany(sp => sp.SentencePatternExamples)
                .HasForeignKey(e => e.SentencePatternId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ MEASURE WORD ============
        builder.Entity<MeasureWord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Character)
                .IsRequired()
                .HasMaxLength(10);
            entity.Property(e => e.Pinyin)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Meaning)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.UsageDescription).HasMaxLength(500);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
        });

        // ============ MEASURE WORD EXAMPLE ============
        builder.Entity<MeasureWordExample>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExampleText)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Pinyin).HasMaxLength(200);
            entity.Property(e => e.Translation)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Explanation).HasMaxLength(300);
            entity.Property(e => e.SortOrder)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.MeasureWord)
                .WithMany(mw => mw.MeasureWordExamples)
                .HasForeignKey(e => e.MeasureWordId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ WORD MEASURE WORD (Many-to-Many) ============
        builder.Entity<WordMeasureWord>(entity =>
        {
            entity.HasKey(e => new { e.WordId, e.MeasureWordId });

            entity.HasOne(e => e.Word)
                .WithMany(w => w.WordMeasureWords)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.MeasureWord)
                .WithMany(mw => mw.WordMeasureWords)
                .HasForeignKey(e => e.MeasureWordId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ WRITING EXERCISE ============
        builder.Entity<WritingExercise>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.Instructions).HasMaxLength(500);
            entity.Property(e => e.ExpectedStrokeCount).IsRequired();
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.WritingExercises)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Word)
                .WithMany(w => w.WritingExercises)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ TRANSLATION HISTORY ============
        builder.Entity<TranslationHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SourceText).IsRequired();
            entity.Property(e => e.SourceLanguage)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.TranslatedText).IsRequired();
            entity.Property(e => e.TargetLanguage)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ USER LESSON PROGRESS ============
        builder.Entity<UserLessonProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Score).IsRequired();
            entity.Property(e => e.TotalQuestions).IsRequired();
            entity.Property(e => e.TotalPoints).IsRequired();
            entity.Property(e => e.CorrectAnswers).IsRequired();
            entity.Property(e => e.WrongAnswers).IsRequired();
            entity.Property(e => e.CompletedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.UserLessonProgresses)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ExamPaper)
                .WithMany(ep => ep.UserLessonProgresses)
                .HasForeignKey(e => e.ExamPaperId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CompletedAt);
        });

        // ============ USER ANSWER ============
        builder.Entity<UserAnswer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IsCorrect).IsRequired();
            entity.Property(e => e.PointsEarned)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.UserProgress)
                .WithMany(ulp => ulp.UserAnswers)
                .HasForeignKey(e => e.UserProgressId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Question)
                .WithMany(q => q.UserAnswers)
                .HasForeignKey(e => e.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.SelectedOption)
                .WithMany(qo => qo.UserAnswers)
                .HasForeignKey(e => e.SelectedOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ============ USER WORD PROGRESS ============
        builder.Entity<UserWordProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("New");
            entity.Property(e => e.NextReviewDate)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.ReviewCount)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.CorrectCount)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.WrongCount)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Word)
                .WithMany(w => w.UserWordProgresses)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.WordId }).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.NextReviewDate });
            entity.HasIndex(e => e.Status);
        });

        // ============ USER LESSON STATUS ============
        builder.Entity<UserLessonStatus>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("NotStarted");
            entity.Property(e => e.ProgressPercentage)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.UserLessonStatuses)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.LessonId }).IsUnique();
        });

        // ============ USER COURSE STATUS ============
        builder.Entity<UserCourseStatus>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("NotStarted");
            entity.Property(e => e.ProgressPercentage)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Course)
                .WithMany(c => c.UserCourseStatuses)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.CourseId }).IsUnique();
        });

        // ============ USER DIALOGUE PROGRESS ============
        builder.Entity<UserDialogueProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("NotStarted");
            entity.Property(e => e.TimesListened)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Dialogue)
                .WithMany(d => d.UserDialogueProgresses)
                .HasForeignKey(e => e.DialogueId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.DialogueId }).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.DialogueId);
        });

        // ============ USER ACTIVITY PROGRESS ============
        builder.Entity<UserActivityProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.ActivityId)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.IsCompleted)
                .IsRequired()
                .HasDefaultValue(false);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Unique constraint: User chỉ có 1 record cho mỗi activity của 1 part/topic
            entity.HasIndex(e => new { e.UserId, e.HskLevel, e.PartNumber, e.ActivityId })
                .IsUnique()
                .HasFilter("[HskLevel] IS NOT NULL AND [PartNumber] IS NOT NULL");
            
            entity.HasIndex(e => new { e.UserId, e.TopicId, e.ActivityId })
                .IsUnique()
                .HasFilter("[TopicId] IS NOT NULL");
            
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.HskLevel, e.PartNumber });
            entity.HasIndex(e => e.TopicId);
        });

        // ============ USER READING PROGRESS ============
        builder.Entity<UserReadingProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("NotStarted");
            entity.Property(e => e.WordsMarkedCount)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Passage)
                .WithMany(p => p.UserReadingProgresses)
                .HasForeignKey(e => e.PassageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.PassageId }).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.PassageId);
        });

        // ============ USER READING WORD MARK ============
        builder.Entity<UserReadingWordMark>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.MarkType)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Unknown");
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Passage)
                .WithMany()
                .HasForeignKey(e => e.PassageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Word)
                .WithMany(w => w.UserReadingWordMarks)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.PassageId, e.WordId }).IsUnique();
            entity.HasIndex(e => new { e.UserId, e.PassageId });
            entity.HasIndex(e => e.WordId);
        });

        // ============ USER RADICAL PROGRESS ============
        builder.Entity<UserRadicalProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("NotStarted");
            entity.Property(e => e.PracticeCount)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Radical)
                .WithMany(r => r.UserRadicalProgresses)
                .HasForeignKey(e => e.RadicalId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.RadicalId }).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Status);
        });

        // ============ USER WRITING PROGRESS ============
        builder.Entity<UserWritingProgress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.AttemptsCount)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.IsCompleted)
                .IsRequired()
                .HasDefaultValue(false);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.WritingExercise)
                .WithMany(we => we.UserWritingProgresses)
                .HasForeignKey(e => e.WritingExerciseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.WritingExerciseId }).IsUnique();
        });

        // ============ USER WRITING ATTEMPT ============
        builder.Entity<UserWritingAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.AttemptedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.WritingExercise)
                .WithMany(we => we.UserWritingAttempts)
                .HasForeignKey(e => e.WritingExerciseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ============ USER PRONUNCIATION ATTEMPT ============
        builder.Entity<UserPronunciationAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.SentenceText).HasMaxLength(500);
            entity.Property(e => e.Feedback).HasMaxLength(1000);
            entity.Property(e => e.AttemptedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Word)
                .WithMany(w => w.UserPronunciationAttempts)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.WordId);
            entity.HasIndex(e => e.AttemptedAt);
        });

        // ============ FAVORITE WORD ============
        builder.Entity<FavoriteWord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Word)
                .WithMany(w => w.FavoriteWords)
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.WordId }).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.WordId);
        });

        // ============ FAVORITE SENTENCE PATTERN ============
        builder.Entity<FavoriteSentencePattern>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SentencePattern)
                .WithMany(sp => sp.FavoriteSentencePatterns)
                .HasForeignKey(e => e.SentencePatternId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.SentencePatternId }).IsUnique();
        });

        // ============ EXAM RESULT ANALYSIS ============
        builder.Entity<ExamResultAnalysis>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserProgressId).IsRequired();
            entity.Property(e => e.SkillType)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.Score).IsRequired();
            entity.Property(e => e.MaxScore).IsRequired();
            entity.Property(e => e.CorrectCount).IsRequired();
            entity.Property(e => e.WrongCount).IsRequired();
            entity.Property(e => e.Strengths).HasMaxLength(500);
            entity.Property(e => e.Weaknesses).HasMaxLength(500);
            entity.Property(e => e.Recommendations).HasMaxLength(1000);

            entity.HasOne(e => e.UserProgress)
                .WithMany(ulp => ulp.ExamResultAnalyses)
                .HasForeignKey(e => e.UserProgressId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserProgressId);
        });

        // ============ LEADERBOARD ============
        builder.Entity<Leaderboard>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.Score).IsRequired();
            entity.Property(e => e.TotalPoints).IsRequired();
            entity.Property(e => e.CompletedAt).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ExamPaper)
                .WithMany(ep => ep.Leaderboards)
                .HasForeignKey(e => e.ExamPaperId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.ExamPaperId, e.Score });
            entity.HasIndex(e => new { e.UserId, e.ExamPaperId });
        });

        // ============ USER DAILY STATS ============
        builder.Entity<UserDailyStats>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId)
                .IsRequired()
                .HasMaxLength(450);
            entity.Property(e => e.StatDate).IsRequired();
            entity.Property(e => e.WordsLearned)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.WordsReviewed)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.LessonsCompleted)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.QuestionsAnswered)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.CorrectAnswers)
                .IsRequired()
                .HasDefaultValue(0);
            entity.Property(e => e.StudyTimeMinutes)
                .IsRequired()
                .HasDefaultValue(0);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.StatDate }).IsUnique();
        });
    }
}
