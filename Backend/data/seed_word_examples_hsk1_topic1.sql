-- Script SQL để seed các ví dụ từ file hsk1_topic1_with_images.json vào bảng WordExamples
-- Chạy script này trực tiếp trong SQL Server Management Studio hoặc sqlcmd

-- 不客气 (id: 7)
DECLARE @WordId INT;
SELECT @WordId = Id FROM Words WHERE Character = N'不客气' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'谢谢！' AND Pinyin = N'xièxie!')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'谢谢！', N'xièxie!', N'Cảm ơn!', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'不客气！' AND Pinyin = N'bú kèqi!')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'不客气！', N'bú kèqi!', N'Không có gì!', NULL, 1);
END

-- 对不起 (id: 23)
SELECT @WordId = Id FROM Words WHERE Character = N'对不起' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'对不起！' AND Pinyin = N'duìbuqǐ!')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'对不起！', N'duìbuqǐ!', N'Xin lỗi!', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'对不起，我迟到了' AND Pinyin = N'duìbuqǐ, wǒ chídào le')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'对不起，我迟到了', N'duìbuqǐ, wǒ chídào le', N'Xin lỗi, tôi đến muộn', NULL, 1);
END

-- 好 (id: 36)
SELECT @WordId = Id FROM Words WHERE Character = N'好' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'很好' AND Pinyin = N'hěn hǎo')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'很好', N'hěn hǎo', N'rất tốt', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'好人' AND Pinyin = N'hǎo rén')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'好人', N'hǎo rén', N'người tốt', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你好' AND Pinyin = N'nǐ hǎo')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你好', N'nǐ hǎo', N'xin chào', NULL, 2);
END

-- 吗 (id: 60)
SELECT @WordId = Id FROM Words WHERE Character = N'吗' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你好吗？' AND Pinyin = N'nǐ hǎo ma?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你好吗？', N'nǐ hǎo ma?', N'Bạn khỏe không?', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你是学生吗？' AND Pinyin = N'nǐ shì xuésheng ma?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你是学生吗？', N'nǐ shì xuésheng ma?', N'Bạn là học sinh không?', NULL, 1);
END

-- 没关系 (id: 63)
SELECT @WordId = Id FROM Words WHERE Character = N'没关系' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'对不起' AND Pinyin = N'duìbuqǐ')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'对不起', N'duìbuqǐ', N'Xin lỗi', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'没关系' AND Pinyin = N'méi guānxi')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'没关系', N'méi guānxi', N'Không sao', NULL, 1);
END

-- 哪 (id: 68)
SELECT @WordId = Id FROM Words WHERE Character = N'哪' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'哪个？' AND Pinyin = N'nǎ ge?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'哪个？', N'nǎ ge?', N'Cái nào?', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'哪本书？' AND Pinyin = N'nǎ běn shū?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'哪本书？', N'nǎ běn shū?', N'Cuốn sách nào?', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'哪个人？' AND Pinyin = N'nǎ ge rén?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'哪个人？', N'nǎ ge rén?', N'Người nào?', NULL, 2);
END

-- 哪儿 (id: 69)
SELECT @WordId = Id FROM Words WHERE Character = N'哪儿' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你在哪儿？' AND Pinyin = N'nǐ zài nǎr?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你在哪儿？', N'nǐ zài nǎr?', N'Bạn ở đâu?', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'学校在哪儿？' AND Pinyin = N'xuéxiào zài nǎr?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'学校在哪儿？', N'xuéxiào zài nǎr?', N'Trường học ở đâu?', NULL, 1);
END

-- 那 (id: 70)
SELECT @WordId = Id FROM Words WHERE Character = N'那' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'那是我的书' AND Pinyin = N'nà shì wǒ de shū')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'那是我的书', N'nà shì wǒ de shū', N'Đó là sách của tôi', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'那个人' AND Pinyin = N'nà ge rén')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'那个人', N'nà ge rén', N'Người đó', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'那本书' AND Pinyin = N'nà běn shū')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'那本书', N'nà běn shū', N'Cuốn sách đó', NULL, 2);
END

-- 呢 (id: 71)
SELECT @WordId = Id FROM Words WHERE Character = N'呢' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你呢？' AND Pinyin = N'nǐ ne?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你呢？', N'nǐ ne?', N'Còn bạn thì sao?', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'我的书呢？' AND Pinyin = N'wǒ de shū ne?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'我的书呢？', N'wǒ de shū ne?', N'Sách của tôi đâu?', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'他在哪儿呢？' AND Pinyin = N'tā zài nǎr ne?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'他在哪儿呢？', N'tā zài nǎr ne?', N'Anh ấy ở đâu vậy?', NULL, 2);
END

-- 你 (id: 73)
SELECT @WordId = Id FROM Words WHERE Character = N'你' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你好' AND Pinyin = N'nǐ hǎo')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你好', N'nǐ hǎo', N'Xin chào', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你是学生' AND Pinyin = N'nǐ shì xuésheng')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你是学生', N'nǐ shì xuésheng', N'Bạn là học sinh', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你叫什么名字？' AND Pinyin = N'nǐ jiào shénme míngzi?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你叫什么名字？', N'nǐ jiào shénme míngzi?', N'Bạn tên gì?', NULL, 2);
END

-- 请 (id: 82)
SELECT @WordId = Id FROM Words WHERE Character = N'请' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'请坐' AND Pinyin = N'qǐng zuò')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'请坐', N'qǐng zuò', N'Xin mời ngồi', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'请进' AND Pinyin = N'qǐng jìn')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'请进', N'qǐng jìn', N'Xin mời vào', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'请喝茶' AND Pinyin = N'qǐng hē chá')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'请喝茶', N'qǐng hē chá', N'Xin mời uống trà', NULL, 2);
END

-- 是 (id: 96)
SELECT @WordId = Id FROM Words WHERE Character = N'是' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'我是学生' AND Pinyin = N'wǒ shì xuésheng')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'我是学生', N'wǒ shì xuésheng', N'Tôi là học sinh', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'这是书' AND Pinyin = N'zhè shì shū')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'这是书', N'zhè shì shū', N'Đây là sách', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'他是老师' AND Pinyin = N'tā shì lǎoshī')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'他是老师', N'tā shì lǎoshī', N'Anh ấy là giáo viên', NULL, 2);
END

-- 喂 (id: 110)
SELECT @WordId = Id FROM Words WHERE Character = N'喂' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'喂，你好！' AND Pinyin = N'wèi, nǐ hǎo!')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'喂，你好！', N'wèi, nǐ hǎo!', N'Alo, xin chào!', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'喂，请问...' AND Pinyin = N'wèi, qǐng wèn...')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'喂，请问...', N'wèi, qǐng wèn...', N'Alo, xin hỏi...', NULL, 1);
END

-- 谢谢 (id: 125)
SELECT @WordId = Id FROM Words WHERE Character = N'谢谢' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'谢谢！' AND Pinyin = N'xièxie!')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'谢谢！', N'xièxie!', N'Cảm ơn!', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'谢谢你' AND Pinyin = N'xièxie nǐ')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'谢谢你', N'xièxie nǐ', N'Cảm ơn bạn', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'谢谢你的帮助' AND Pinyin = N'xièxie nǐ de bāngzhù')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'谢谢你的帮助', N'xièxie nǐ de bāngzhù', N'Cảm ơn sự giúp đỡ của bạn', NULL, 2);
END

-- 再见 (id: 139)
SELECT @WordId = Id FROM Words WHERE Character = N'再见' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'再见！' AND Pinyin = N'zàijiàn!')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'再见！', N'zàijiàn!', N'Tạm biệt!', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'明天再见' AND Pinyin = N'míngtiān zàijiàn')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'明天再见', N'míngtiān zàijiàn', N'Ngày mai gặp lại', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'再见，朋友！' AND Pinyin = N'zàijiàn, péngyou!')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'再见，朋友！', N'zàijiàn, péngyou!', N'Tạm biệt, bạn!', NULL, 2);
END

-- 怎么 (id: 140)
SELECT @WordId = Id FROM Words WHERE Character = N'怎么' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'怎么去？' AND Pinyin = N'zěnme qù?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'怎么去？', N'zěnme qù?', N'Đi như thế nào?', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'怎么说？' AND Pinyin = N'zěnme shuō?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'怎么说？', N'zěnme shuō?', N'Nói như thế nào?', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'怎么学习？' AND Pinyin = N'zěnme xuéxí?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'怎么学习？', N'zěnme xuéxí?', N'Học như thế nào?', NULL, 2);
END

-- 怎么样 (id: 141)
SELECT @WordId = Id FROM Words WHERE Character = N'怎么样' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'你怎么样？' AND Pinyin = N'nǐ zěnmeyàng?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'你怎么样？', N'nǐ zěnmeyàng?', N'Bạn thế nào?', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'这本书怎么样？' AND Pinyin = N'zhè běn shū zěnmeyàng?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'这本书怎么样？', N'zhè běn shū zěnmeyàng?', N'Cuốn sách này thế nào?', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'天气怎么样？' AND Pinyin = N'tiānqì zěnmeyàng?')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'天气怎么样？', N'tiānqì zěnmeyàng?', N'Thời tiết thế nào?', NULL, 2);
END

-- 这 (id: 142)
SELECT @WordId = Id FROM Words WHERE Character = N'这' AND HSKLevel = 1;
IF @WordId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'这是我的书' AND Pinyin = N'zhè shì wǒ de shū')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'这是我的书', N'zhè shì wǒ de shū', N'Đây là sách của tôi', NULL, 0);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'这个人' AND Pinyin = N'zhè ge rén')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'这个人', N'zhè ge rén', N'Người này', NULL, 1);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'这本书' AND Pinyin = N'zhè běn shū')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'这本书', N'zhè běn shū', N'Cuốn sách này', NULL, 2);
    
    IF NOT EXISTS (SELECT 1 FROM WordExamples WHERE WordId = @WordId AND Character = N'这里' AND Pinyin = N'zhèlǐ')
        INSERT INTO WordExamples (WordId, Character, Pinyin, Meaning, AudioUrl, SortOrder)
        VALUES (@WordId, N'这里', N'zhèlǐ', N'Ở đây', NULL, 3);
END

PRINT 'Đã seed xong tất cả ví dụ cho từ vựng HSK1 chủ đề 1!';

