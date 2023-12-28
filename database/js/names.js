
const names = ["Hạ Tường Anh",
"Thi Gia Bảo",
"Hồ Thiệu Bảo",
"Trà Minh Ðan",
"Mạch Anh Ðức",
"Khoa Huy Khánh",
"Liên Quốc Khánh",
"Hướng Quang Hà",
"Tề Sơn Hải",
"Viên Bảo Hòa",
"Sầm Phi Long",
"Ngọc Ðức Quảng",
"Đèo Bá Thịnh",
"Giàng Hồng Thịnh",
"Vưu Hải Thụy",
"H'ma Quang Vũ",
"Trác Bích Huệ",
"Khổng Cẩm Nhung",
"Âu Dương Cẩm Vân",
"Diệp Ðông Trà",
"Hồng Hà Liên",
"Thân Hồng Tâm",
"Đan Minh Thủy",
"Lãnh Ngọc Ðàn",
"Thào Ngọc Hiền",
"Quách Ngọc Hoa",
"Giang Ngọc Nữ",
"Cảnh Nhật Mai",
"Diêm Phượng Uyên",
"Vũ Quỳnh Thơ",
"Sái Thiên Mỹ",
"Lộ Thu Thủy"]

// take a number from cmd arg, print that many names
for (let i = 0; i < Number(process.argv[2] ?? 10); i++) {
    console.log(names[Math.floor(Math.random() * names.length)]);
}