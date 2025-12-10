using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <summary>
    /// Migration để seed dữ liệu ngữ pháp cho tất cả từ vựng HSK1
    /// Bao gồm: PartOfSpeech, PartOfSpeechVi, PartOfSpeechEn, GrammarNote
    /// </summary>
    public partial class SeedGrammarDataAllHsk1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ========== DANH TỪ (名词 - Noun) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'名词',
                    PartOfSpeechVi = N'Danh từ',
                    PartOfSpeechEn = N'Noun'
                WHERE HSKLevel = 1 AND Character IN (
                    N'爸爸', N'北京', N'杯子', N'本', N'菜', N'茶', N'出租车', N'电脑', 
                    N'电视', N'电影', N'东西', N'儿子', N'饭店', N'飞机', N'工作', 
                    N'狗', N'汉语', N'家', N'老师', N'妈妈', N'猫', N'名字', N'米饭', 
                    N'明天', N'女儿', N'朋友', N'苹果', N'钱', N'前面', N'人', N'商店', 
                    N'上午', N'书', N'水', N'水果', N'天气', N'同学', N'先生', N'小姐', 
                    N'学生', N'学校', N'衣服', N'医生', N'医院', N'椅子', N'月', N'中国', 
                    N'中午', N'桌子', N'字', N'昨天', N'后面', N'今天', N'年', N'星期',
                    N'分钟', N'时候'
                );
            ");

            // ========== ĐỘNG TỪ (动词 - Verb) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'动词',
                    PartOfSpeechVi = N'Động từ',
                    PartOfSpeechEn = N'Verb'
                WHERE HSKLevel = 1 AND Character IN (
                    N'爱', N'吃', N'打电话', N'读', N'喝', N'回', N'会', N'叫', N'开', 
                    N'看', N'看见', N'来', N'买', N'能', N'认识', N'去', N'睡觉', N'说', 
                    N'听', N'想', N'写', N'学习', N'有', N'住', N'坐', N'做', N'下雨',
                    N'喜欢', N'是', N'在'
                );
            ");

            // ========== TÍNH TỪ (形容词 - Adjective) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'形容词',
                    PartOfSpeechVi = N'Tính từ',
                    PartOfSpeechEn = N'Adjective'
                WHERE HSKLevel = 1 AND Character IN (
                    N'大', N'多', N'好', N'冷', N'漂亮', N'热', N'少', N'小', N'高兴'
                );
            ");

            // ========== ĐẠI TỪ (代词 - Pronoun) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'代词',
                    PartOfSpeechVi = N'Đại từ',
                    PartOfSpeechEn = N'Pronoun'
                WHERE HSKLevel = 1 AND Character IN (
                    N'你', N'我', N'他', N'她', N'我们', N'这', N'那', N'哪', N'哪儿', 
                    N'谁', N'什么', N'怎么', N'怎么样', N'多少', N'几'
                );
            ");

            // ========== SỐ TỪ (数词 - Numeral) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'数词',
                    PartOfSpeechVi = N'Số từ',
                    PartOfSpeechEn = N'Numeral'
                WHERE HSKLevel = 1 AND Character IN (
                    N'一', N'二', N'三', N'四', N'五', N'六', N'七', N'八', N'九', N'十'
                );
            ");

            // ========== LƯỢNG TỪ (量词 - Measure Word) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'量词',
                    PartOfSpeechVi = N'Lượng từ',
                    PartOfSpeechEn = N'Measure Word'
                WHERE HSKLevel = 1 AND Character IN (
                    N'个', N'块', N'些', N'岁', N'点'
                );
            ");

            // ========== PHÓ TỪ (副词 - Adverb) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'副词',
                    PartOfSpeechVi = N'Phó từ',
                    PartOfSpeechEn = N'Adverb'
                WHERE HSKLevel = 1 AND Character IN (
                    N'不', N'都', N'很', N'没有', N'太', N'现在', N'一点儿'
                );
            ");

            // ========== GIỚI TỪ (介词 - Preposition) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'介词',
                    PartOfSpeechVi = N'Giới từ',
                    PartOfSpeechEn = N'Preposition'
                WHERE HSKLevel = 1 AND Character IN (
                    N'上', N'下', N'里'
                );
            ");

            // ========== LIÊN TỪ (连词 - Conjunction) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'连词',
                    PartOfSpeechVi = N'Liên từ',
                    PartOfSpeechEn = N'Conjunction'
                WHERE HSKLevel = 1 AND Character IN (
                    N'和'
                );
            ");

            // ========== TRỢ TỪ (助词 - Particle) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'助词',
                    PartOfSpeechVi = N'Trợ từ',
                    PartOfSpeechEn = N'Particle'
                WHERE HSKLevel = 1 AND Character IN (
                    N'的', N'了', N'吗', N'呢'
                );
            ");

            // ========== THÁN TỪ (叹词 - Interjection) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'叹词',
                    PartOfSpeechVi = N'Thán từ',
                    PartOfSpeechEn = N'Interjection'
                WHERE HSKLevel = 1 AND Character IN (
                    N'喂'
                );
            ");

            // ========== CỤM TỪ / THÀNH NGỮ (短语 - Phrase) ==========
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'短语',
                    PartOfSpeechVi = N'Cụm từ',
                    PartOfSpeechEn = N'Phrase'
                WHERE HSKLevel = 1 AND Character IN (
                    N'不客气', N'对不起', N'没关系', N'谢谢', N'再见', N'请'
                );
            ");

            // ========== GHI CHÚ NGỮ PHÁP ==========
            
            // 的 - Trợ từ sở hữu
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Dùng để chỉ sở hữu hoặc mô tả. Đặt giữa danh từ/đại từ và danh từ. Ví dụ: 我的书 (sách của tôi), 漂亮的女孩 (cô gái đẹp).',
                    Structure = N'A + 的 + B'
                WHERE HSKLevel = 1 AND Character = N'的';
            ");

            // 了 - Trợ từ hoàn thành
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Dùng để chỉ hành động đã hoàn thành hoặc thay đổi trạng thái. Đặt sau động từ. Ví dụ: 我吃了 (tôi đã ăn).',
                    Structure = N'Động từ + 了'
                WHERE HSKLevel = 1 AND Character = N'了';
            ");

            // 吗 - Trợ từ nghi vấn
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Dùng để biến câu trần thuật thành câu hỏi có/không. Đặt cuối câu. Ví dụ: 你好吗？(Bạn khỏe không?)',
                    Structure = N'Câu trần thuật + 吗？'
                WHERE HSKLevel = 1 AND Character = N'吗';
            ");

            // 呢 - Trợ từ nghi vấn
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Dùng để hỏi lại hoặc nhấn mạnh. Thường dùng với nghĩa ""thế còn...?"". Ví dụ: 你呢？(Còn bạn thì sao?)',
                    Structure = N'Danh từ/Đại từ + 呢？'
                WHERE HSKLevel = 1 AND Character = N'呢';
            ");

            // 是 - Động từ ""là""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Động từ ""là"" dùng để kết nối chủ ngữ với danh từ/cụm danh từ. Không dùng với tính từ. Ví dụ: 我是学生 (Tôi là học sinh).',
                    Structure = N'A + 是 + B'
                WHERE HSKLevel = 1 AND Character = N'是';
            ");

            // 在 - Động từ/Giới từ chỉ vị trí
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'1) Động từ: chỉ vị trí ""ở"". 2) Giới từ: chỉ nơi chốn. 3) Phó từ: chỉ hành động đang diễn ra. Ví dụ: 我在家 (Tôi ở nhà).',
                    Structure = N'Chủ ngữ + 在 + Địa điểm'
                WHERE HSKLevel = 1 AND Character = N'在';
            ");

            // 有 - Động từ ""có""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Động từ chỉ sự sở hữu hoặc tồn tại. Phủ định dùng 没有. Ví dụ: 我有一本书 (Tôi có một quyển sách).',
                    Structure = N'Chủ ngữ + 有 + Tân ngữ'
                WHERE HSKLevel = 1 AND Character = N'有';
            ");

            // 没有 - Phủ định của 有
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Phủ định của động từ 有, cũng dùng để phủ định hành động đã xảy ra. Ví dụ: 我没有书 (Tôi không có sách).',
                    Structure = N'Chủ ngữ + 没有 + Tân ngữ'
                WHERE HSKLevel = 1 AND Character = N'没有';
            ");

            // 不 - Phó từ phủ định
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Phó từ phủ định, dùng trước động từ/tính từ để phủ định. Không dùng với 有. Ví dụ: 我不去 (Tôi không đi).',
                    Structure = N'不 + Động từ/Tính từ'
                WHERE HSKLevel = 1 AND Character = N'不';
            ");

            // 很 - Phó từ ""rất""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Phó từ mức độ, đặt trước tính từ. Khi dùng với tính từ làm vị ngữ, 很 thường bắt buộc. Ví dụ: 她很漂亮 (Cô ấy rất đẹp).',
                    Structure = N'很 + Tính từ'
                WHERE HSKLevel = 1 AND Character = N'很';
            ");

            // 太 - Phó từ ""quá""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Phó từ chỉ mức độ quá, thường mang nghĩa tiêu cực hoặc tích cực tùy ngữ cảnh. Ví dụ: 太好了！(Tuyệt quá!)',
                    Structure = N'太 + Tính từ + 了'
                WHERE HSKLevel = 1 AND Character = N'太';
            ");

            // 都 - Phó từ ""đều/tất cả""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Phó từ chỉ tổng thể, đặt trước động từ/tính từ, sau chủ ngữ. Ví dụ: 我们都是学生 (Chúng tôi đều là học sinh).',
                    Structure = N'Chủ ngữ + 都 + Động từ/Tính từ'
                WHERE HSKLevel = 1 AND Character = N'都';
            ");

            // 会 - Động từ năng nguyện ""biết cách""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Động từ năng nguyện chỉ khả năng đã học được. Ví dụ: 我会说汉语 (Tôi biết nói tiếng Trung).',
                    Structure = N'Chủ ngữ + 会 + Động từ'
                WHERE HSKLevel = 1 AND Character = N'会';
            ");

            // 能 - Động từ năng nguyện ""có thể""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Động từ năng nguyện chỉ khả năng hoặc được phép. Ví dụ: 我能帮你 (Tôi có thể giúp bạn).',
                    Structure = N'Chủ ngữ + 能 + Động từ'
                WHERE HSKLevel = 1 AND Character = N'能';
            ");

            // 想 - Động từ ""muốn/nghĩ""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'1) Động từ năng nguyện: muốn làm gì. 2) Động từ: nghĩ, nhớ. Ví dụ: 我想吃饭 (Tôi muốn ăn cơm).',
                    Structure = N'Chủ ngữ + 想 + Động từ/Tân ngữ'
                WHERE HSKLevel = 1 AND Character = N'想';
            ");

            // 喜欢 - Động từ ""thích""
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Động từ chỉ sở thích. Có thể theo sau là danh từ hoặc động từ. Ví dụ: 我喜欢中国 (Tôi thích Trung Quốc).',
                    Structure = N'Chủ ngữ + 喜欢 + Tân ngữ/Động từ'
                WHERE HSKLevel = 1 AND Character = N'喜欢';
            ");

            // 个 - Lượng từ phổ biến nhất
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    GrammarNote = N'Lượng từ phổ biến nhất, dùng cho người và nhiều đồ vật. Ví dụ: 一个人 (một người), 三个苹果 (ba quả táo).',
                    Structure = N'Số từ + 个 + Danh từ'
                WHERE HSKLevel = 1 AND Character = N'个';
            ");

            // Cập nhật các từ còn lại chưa có PartOfSpeech
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = N'其他',
                    PartOfSpeechVi = N'Khác',
                    PartOfSpeechEn = N'Other'
                WHERE HSKLevel = 1 AND PartOfSpeech IS NULL;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Words SET 
                    PartOfSpeech = NULL,
                    PartOfSpeechVi = NULL,
                    PartOfSpeechEn = NULL,
                    GrammarNote = NULL,
                    Structure = NULL
                WHERE HSKLevel = 1;
            ");
        }
    }
}
