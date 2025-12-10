using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HiHSK.Infrastructure.Migrations
{
    /// <summary>
    /// Migration để gán TopicId cho các từ vựng HSK1
    /// Dựa trên 12 chủ đề trong LessonTopics
    /// </summary>
    public partial class SeedWordTopicIds : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Topic 1: Chào hỏi & Giao tiếp cơ bản
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 1 WHERE HSKLevel = 1 AND Character IN (
                    N'不客气', N'对不起', N'好', N'吗', N'哪', N'哪儿', N'那', N'呢', N'你', 
                    N'请', N'是', N'喂', N'谢谢', N'再见', N'怎么', N'怎么样', N'这'
                );
            ");

            // Topic 2: Số đếm & Thời gian
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 2 WHERE HSKLevel = 1 AND Character IN (
                    N'八', N'点', N'二', N'分钟', N'号', N'今天', N'九', N'六', N'明天', 
                    N'年', N'七', N'三', N'上午', N'十', N'时候', N'四', N'五', N'下午', 
                    N'现在', N'星期', N'一', N'月', N'昨天', N'中午'
                );
            ");

            // Topic 3: Người & Gia đình
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 3 WHERE HSKLevel = 1 AND Character IN (
                    N'爸爸', N'儿子', N'家', N'老师', N'妈妈', N'名字', N'女儿', N'朋友', 
                    N'人', N'同学', N'先生', N'小姐', N'学生', N'医生'
                );
            ");

            // Topic 4: Động từ cơ bản
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 4 WHERE HSKLevel = 1 AND Character IN (
                    N'吃', N'打电话', N'读', N'工作', N'喝', N'回', N'会', N'叫', N'开', 
                    N'看', N'看见', N'来', N'买', N'能', N'认识', N'去', N'睡觉', N'说', 
                    N'听', N'想', N'写', N'学习', N'有', N'坐', N'做'
                );
            ");

            // Topic 5: Tính từ & Mô tả
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 5 WHERE HSKLevel = 1 AND Character IN (
                    N'大', N'多', N'很', N'冷', N'漂亮', N'热', N'少', N'太', N'小'
                );
            ");

            // Topic 6: Địa điểm & Phương hướng
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 6 WHERE HSKLevel = 1 AND Character IN (
                    N'北京', N'饭店', N'后面', N'里', N'前面', N'商店', N'上', N'下', 
                    N'学校', N'医院', N'在', N'中国'
                );
            ");

            // Topic 7: Thức ăn & Đồ uống
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 7 WHERE HSKLevel = 1 AND Character IN (
                    N'杯子', N'菜', N'茶', N'米饭', N'苹果', N'水', N'水果'
                );
            ");

            // Topic 8: Màu sắc & Đồ vật
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 8 WHERE HSKLevel = 1 AND Character IN (
                    N'本', N'出租车', N'电脑', N'电视', N'电影', N'东西', N'飞机', N'个', 
                    N'块', N'书', N'些', N'衣服', N'椅子', N'桌子', N'字'
                );
            ");

            // Topic 9: Thời tiết & Thiên nhiên
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 9 WHERE HSKLevel = 1 AND Character IN (
                    N'狗', N'猫', N'天气', N'下雨'
                );
            ");

            // Topic 12: Tổng hợp & Ôn tập (đại từ, hư từ, phó từ)
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 12 WHERE HSKLevel = 1 AND Character IN (
                    N'爱', N'不', N'的', N'都', N'多少', N'高兴', N'汉语', N'和', N'几', 
                    N'了', N'没有', N'钱', N'什么', N'谁', N'岁', N'他', N'她', N'我', 
                    N'我们', N'喜欢', N'一点儿', N'住'
                );
            ");

            // Đặt TopicId = 12 cho tất cả từ HSK1 chưa được gán topic
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = 12 WHERE HSKLevel = 1 AND TopicId IS NULL;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Words SET TopicId = NULL WHERE HSKLevel = 1;
            ");
        }
    }
}
