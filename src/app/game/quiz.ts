import * as seedrandom from "seedrandom"
import { QuizItem, shuffle } from "./models"

export const settings = {
  count: 7
}

const popular = `
ai
ăn
anh
bà
bán
bạn
bánh
bao giờ
bao nhiêu
bỏ
các
cách
cái
cần
cao
chai
chán
chỉ
chị
cho
chỗ
chợ
chơi
có
con
cứ
của
cũng
dễ
đã
đâu
đầy
đầy đủ
để
đèn
đi
đi chơi
đó
đủ
em
gà
giờ
giữa
gọi
hình
ho
hoặc
hỏi
in
khi
không
là
làm
lắm
làm ơn
lúc
mà
mấy
mình
một
mua
muốn
nào
này
ngồi
ngon
nhỏ
nhớ
nhóm
nước
ở
ơi
ốm
quá
rẻ
rồi
sao
sẽ
sớm
sữa
tháng
thấy
thêm
theo
thi
thứ
thử
tiệm
tiền
tìm
tin
trà
trả
trả lời
trang
trước
trước khi
từ
tuần
tuy
uống
và
vào
vay
vậy
về
với
xong
`.trim().split('\n')

// const quizRaw = `
// tạo ra	create
// mảnh đất vật lý	physical land
// hưởng quyền lợi	benefit
// công dân	citizen
// tùy ý	optional
// bất kì	any
// đất	land
// thuế	tax
// chính phủ	government
// giới hạn	limit
// sát nhập	merge
// dần dần	slowly
// phần	part
// tới	coming
// `

const quizRaw = `
à	really? (tag question denotes surprise)
ạ	final article used to show respect
ai	who
alô	hello (on the phone)
ấm	warm
âm lịch	lunar calendar
âm nhạc	music
âm thanh	sound
ăn	to eat
ăn cơm	to eat (rice)
ăn sáng	to eat breakfast
an toàn	safe
ăn tối	to eat dinner
ăn trưa	to eat lunch
anh	elder brother
anh í / ảnh	he; him (North/South)
ánh nắng	sunlight
anh trai	older brother
áo	shirt
áo dài	Vietnamese traditional dress
áo khoác	jacket
áo sơ mi	shirt
ba	father (South); three
bà	grandma; Mrs.
bà ngoại	grandma (mother side)
bà nội	grandma (father side)
bác	uncle (older than parent)
bác sĩ	doctor
bài	post
bài hát	song
bài học	lesson
bài phát biểu	speech
bài tập	drill; exercise; task
bán	to sell
bàn	table
bạn	friend
bận	busy
ban đêm	night
bản đồ	map
bạn gái	girlfriend
ban ngày	daytime
ban nhạc	music band
bàn tay	hand
bạn thân	best friend
bạn trai	boyfriend
bẩn/dơ	dirty (North/South)
bằng	equal, by
bảng	board
bánh	cake; pie; pastry
bánh mì	bread
bánh xe	wheel
báo	newspaper
bảo	to tell (someone)
báo chí	the press
bao giờ	when
bao lâu	how long
bao nhiêu	how many/how much
bao xa	how far
bát / chén	bowl (North/South)
bắt đầu	to begin
bất kỳ	any
bất ngờ	sudden; suddenly; unexpected; surprised
bất tiện	inconvenience
bay	to fly
bây giờ	now
bé	small; little; tiny
bề mặt	surface
bên	side; by; near
bên cạnh	next, beside
bên phải	on the right
bên trái	on the left
bệnh	sick
bệnh viện	hospital
béo/mập	fat (North/South)
bị	to get; to have; to catch; to suffer
bia	beer
biển	sea
biết	to know
bình dân	affordable
bình thường	normal
bò	cow
bố	dad
bỏ	to quit; to leave; to take off
bộ	set (n)
bơi	to swim
bởi vì	because
bóng bàn	table tennis
bóng chuyền	volleyball
bóng đá	soccer
bóng rổ	basketball
bớt	to reduce
bụng	stomach
buổi	session
buổi chiều	afternoon
buổi sáng	morning
buổi tối	night
buồn	sad
bút / viết	pen (North/South)
bút bi / viết bi	ballpoint pen (North/South)
bưu điện	post office
bưu phẩm	parcel
bưu điện	post office
bưu phẩm	parcel
cá	fish (general)
cà chua	tomato
cả hai	both
ca nhạc	music
cà phê	coffee
cà rốt	carrot
ca sĩ	singer
các	every; all
cách	way; method
cái	thing; the...
cái đó/kia	that one
cái gì	what
cái này	this one
cam	orange
cấm	banned
cảm	to catch a cold
cám ơn	thank you
cảm thấy	to feel
cân	weight; to weigh; kilogram (North)
cần	to need; should
cẩn thận	carefully
càng	the more...
căng thẳng	nervous; tense; stressful
canh	soup
cạnh	beside
cao	high; tall
cấp cứu	emergency
câu	sentence
cầu	bridge
cậu	mother’s younger brother; you (friend)
câu chuyện	story
câu hỏi	question
câu lạc bộ	club
cầu lông	badminton
cầu thủ	soccer player
câu trả lời	answer
cay	spicy
cây	tree
chả giò	fried spring roll
chắc chắn	surely
chai	bottle
chậm	slow
chăm chỉ	hardworking
chăm sóc	care; to look after...;
chán	bored; boring
chân	leg; foot
chanh	lime
chào	to greet; hello…
chật	tight
cháu	grandchild; someone as young as your grandchild
châu Á	Asian
châu Âu	Europe
cháu gái	niece
cháu trai	nephew
chạy	to run
chè	tea
chết	to be dead; to die
chỉ	only; merely; just
chị	older sister; to call a older female
chị gái	elder sister
chị í / chỉ	she (North/South)
chi phí	the cost
chi tiêu	to spend
chia tay	to break up
chiếc	a; the; classifier for vehicles, boats, planes, bridges
chiều	late afternoon
chim	bird
chín	nine; cooked
chính	main
cho	for; to give; to let
chó	dogs
chỗ	seat; a spot
chờ	to wait
chợ	market
chơi	to play
chọn	to choose
chồng	husband
chú	uncle (father’s younger brother)
chủ nhà	the host; landlord
chủ nhật	Sunday
chú ý	attention
chua	sour
chùa	pagoda
chưa	not yet
chuẩn bị	to prepare
chúc	to wish
chúc mừng	to congratulate
chúng ta	we, us (including speaker and listener)
chúng tôi	we, us (doesnt include listener)
chuối	banana
chương trình	program
chụp hình	to take a photo
chuyển	to move; to pass on
chuyện	thing; matter; business; affair
chuyên gia	expert
có	to have
cô	she; to address a female
cổ	neck; she
cỡ	size
cơ bản	basic
cô gái	the girl
cố gắng	to try
cô giáo	female teacher
cơ hội	chance
có lẽ	perhaps
cơ quan	agency; office
cơ sở	basis; foundation
có thể	may; can
cơ thể	body
có vẻ	seem to
cơm	rice
con	someone as young as your nice/nephew/grandchild
còn	to have….left
con gái	daughter
con trai	son
cổng	gate
cộng	to plus
công an	the police
công cộng	public
công nhân	worker
công ty	company
công việc	work; job
công viên	park
cũ	old
cứ	just; to continue
cua	crab
của	of
cửa	door
cửa hàng	shop
cửa sổ	window
cùng	same; together; with
cũng	too; also
cuộc sống	life
cuối	last
cười	to laugh
cuối cùng	finally
cuối tuần	weekend
cuốn	classifier for book-type object; to roll
da	skin
dạ	yes; starting particle to show respect
dài	long
dẫn	to lead sb somewhere
dân số	population
dân tộc	ethnic group
dạo này	these days; nowadays
dây	rope; cord; wire
dạy	to teach
dễ	easy
dễ chịu	comfortable
dễ thương	cute
dì	aunt; a female who is around parent’s age
di chuyển	to move
di tích	relics
dịch	to translate
diện tích	area (square meters)
diễn viên	actor; actress
dịp	occasion
do	due to
dở	bad; not good
dự	to attend
dự báo	to forecast
du học	to study abroad
du khách	traveler
du lịch	to travel
dùng	to use
dưới	below
đá	rock; ice; iced
đã	already
đặc biệt	special
đặc sản	specialties
đại học	University
đàn ông	man
đang	to be doing something
đắng	bitter
đăng ký	to register
đăng nhập	to logon; login
đánh dấu	to mark
đánh răng	to brush teeth
đảo	island
đáp ứng	to meet; to satisfy
đặt	to put; to book
đắt / mắc	expensive (North/South)
đất nước	country
đau	painful
đâu	where
đầu	head
đau bụng	stomachache
đau đầu	headache
đầu tiên	the first
đầu tư	to invest
đây	here
đầy	full
đầy đủ	adequate; all
để	to place; to put; so that
đêm	night
đếm	to count
đen	black
đèn	light
đến	to come
đeo	to wear; to carry
đẹp trai	handsome
đều	all; even
đi	to go
đi bộ	to walk
đi chợ	to go to market
đi chơi	to hang out
đi dạo	to go for a walk
đi học	to go to school
đi thẳng	to go straight
đi vắng	to be out/away; to be absent from home
đĩa	plate; disk; CD
địa chỉ	address
địa điểm	location
điền	to fill
điện	electricity
điện thoại	phone
điện thoại di động	cellular phone
định	to plan on…
đó	there
đỡ	to support
độ	degree
đồ ăn	food
đồ uống	beverages
đọc	to read
đói	hungry
đôi	pair; twin
đổi	to exchange; to switch
đợi	to wait
đội	team
đối diện	opposite
đôi khi	sometimes
đối với	with regard to...
đón	to pick up
đơn giản	simple
đóng	to close
đông	east; frozen
đồng hồ	clock; watch
động vật	animals
đồng ý	to agree
đủ	enough; sufficient
đũa	chopstick
đưa	to pass; to give
đúng	correct
đứng	to stand
được	OK; all right
đường	street; sugar
em	someone young enough to be your younger siblings
êm	soft
em gái	younger sister
em trai	younger brother
gà	chicken
gần	near
gần đây	recently
gặp	to meet
gầy/ốm	skinny; thin (North/South)
ghế	chair
ghét	hate
gì	what
già	old
gia đình	family
giá tiền	price
giá trị	value
giải quyết	to resolve; to settle; to deal with sb/sth
giải thích	to explain
giải trí	entertainment
giảm	to reduce; to decrease
giám đốc	manager
giận	angry
giáo sư	professor
giao thông	traffic
giáo viên	teacher
giàu	rich
giày	shoe
giây	second
giấy	paper
gió	wind
giờ	hour
giỏi	great
giới thiệu	to introduce
giống	to look like…; to resemble
giữa	between
giường	bed
giúp	to help
gỗ	wood; lumber
gọi	to call
gửi thư	to mail
gương	mirror
hân hạnh	to have the honor
hàng hoá	goods
hàng không	air; aviation
hàng ngày	daily
hạnh phúc	happy; happiness
hấp dẫn	interesting; attractive
hát	to sing
hay	good; or; often
hệ thống	system
hẹn	to make an appointment
hết	over
hiền	meek; gentle
hiện đại	modern
hiện nay	at the present; nowadays
hiện tại	present; current
hiểu	to understand
hiệu sách	bookstore
hình	form; shape; figure; photo
hình như	to seem
ho	to cough
hồ	lake
họ	they
hộ chiếu	passport
họ hàng	relative
hỗ trợ	to support
hoa	flower
hoá đơn	invoice
hoa quả	fruits
hoạ sĩ	painter
hoặc	or
hoàn thành	to finish; complete
hoạt động	to run; to operate; activities; operations
học	to learn
học sinh	student
hỏi	to ask
hơi	a little; a bit
hôm kia	the day before yesterday
hôm nay	today
hôm qua	yesterday
hơn	than; more than
hơn nữa	moreover; furthermore
hỏng	broken
họng	throat
hợp đồng	contract
hút thuốc	to smoke
hy vọng	hope
im lặng	silent
in	to print
ít	little; few
kể	to tell
kế hoạch	plan
kẻ thù	enemy
kế toán	accountant
kem	cream
kém	less; bad
kết hôn	to marry
kết quả	result
kết thúc	to finish
khác	other; alternative
khác nhau	different
khách	guest
khách hàng	customer
khách sạn	hotel
khám bệnh	to examine; to see a doctor
khát	thirsty
khen	to praise; to compliment
khi	when; while
khí hậu	climate
khi nào	when?
khó	difficult
khó chịu	uncomfortable
khó khăn	hard; difficult
khoa học	science
khoá học	course
khoai tây	potato
khoảng	about; around; approximately
khóc	to cry
khoẻ	healthy; strong
khỏi	to avoid; (there's) no needto…
khối lượng	mass; volume
không	no; not; don't; doesn't; didn't
không bao giờ	never
không khí	air; atmosphere
khu vực	area
khuôn mặt	face
khuyên	to advise
kia	that
kiểm tra	to check
kiến trúc sư	architect
kinh doanh	to do business
kinh nghiệm	experience
kinh tế	economy
ký	to sign; kilogram (South)
kỹ sư	engineer
lá	leaf
là	to be
lạ	strange
lại	again
lái xe	to drive
làm	to do; to make
lắm	much; many; very; a lot
làm ơn	please
làm quen	to get acquainted
làm việc	to work
ần	times
lạnh	cold
lặp lại	to repeat
lâu	long (time)
lấy	to take; to marry
lễ tân	receptionist
lịch sử	history
lịch sự	polite; courteous
liên lạc	to contact; to get in touch
lĩnh vực	sphere; field
lít	liter
lo	to worry
lỡ	to miss out
loại	type; category
lớn	great
lợn/heo	pig (North/South)
lớp học	class; classroom
lửa	fire
luật sư	lawyer
lúc	at
lưng	back
lười	lazy
luôn luôn	always
lương	salary
ly	glass
lý do	reason
má	mother (South)
mà	but
mặc	to wear
mặc cả	to bargain
mặc dù	although
mặn	salty
mang	to bring; to carry; to put on
mát	cool
mắt	eye
mất	to lose; to pass away
mặt	face
mắt kính	eyeglasses
mặt trăng	moon
mặt trời	sun
màu	color
máy	machine
mây	clouds
mấy	how much; how many
máy ảnh	camera
máy bay	plane
máy giặt	washing machine
mấy giờ?	what time?
máy lạnh	air-conditioner
may mắn	lucky
máy vi tính	computer
mẹ	mother
mèo	cat
mét	meter
mệt	to be tired; unwell
miền Bắc	Northern
miền Nam	Southern
miễn phí	free
miền Trung	Central
miệng	mouth
miêu tả	to describe
mình	oneself; myself
mơ	to dream
mở	to open; to turn on
môi	lip
mỗi	each
mới	new
mời	to invite
món	item
món ăn	dish (food)
mong	to hope
mỏng	thin
một	one; a; an; the
một chút	a little; a bit
một ít	a little; a bit
một mình	alone
một số	some; several
mũ/nón	hat (North/South)
mua	to buy
mùa	season
mưa	rain; to rain
mùa đông	winter
mùa hè	summer
mùa khô	dry season
mùa mưa	rainy season
mua sắm	shopping
mùa thu	autumn
mùa xuân	spring
mức độ	level
mùi	odor
mũi	nose
muốn	to want
muộn	late
mượn	to borrow
nam	male
năm	five; year
nằm	to lie (down); located
năm nay	this year
năm ngoái	last year
nắng	sunny
nặng	heavy
nào	what; which; any; whatever
nấu ăn	to cook
này	this
nem rán	fried spring rolls
nên	should
nếu	if
ngã tư	intersection; crossroads
ngạc nhiên	to surprise
ngại	hesitant (shy)
ngàn	thousand
ngắn	short
ngân hàng	bank
ngay	immediate; instant
ngày	day
ngày kia	the day after tomorrow
ngay lập tức	right away
ngày mai	tomorrow
nghe	to listen
nghề	profession
nghe nói	heard of
nghèo	poor
nghĩ	to think
nghỉ	to take a rest/break
nghỉ hè	summer holidays
nghỉ hưu	to retire
nghiên cứu	to research
nghìn/ngàn	thousand (North/South)
ngoài	outside; outdoors; over; apart from…
ngoại ngữ	foreign language
ngoài ra	besides
ngoan	obedient
ngồi	to sit
ngon	tasty
ngôn ngữ	language
ngọt	sweet
ngủ	to sleep
ngực	chest
ngược	upside down; inside out; opposite; contrary
người	people; person; human
người bán hàng	salesman
người yêu	lover
nguy hiểm	danger
nguyên nhân	cause; reason
nhà	home
nhà báo	journalist
nhà hàng	restaurant
nhà hát	theatre
nhà máy	factory
nhà thờ	church
nhạc	music
nhầm	wrong; mistaken
nhận	to receive
nhân viên	employee; worker; staff
nhanh	fast
nhập khẩu	to import; imported
nhất	first; best; most
nhé	all right ? OK?
nhẹ	light
nhiệt độ	temperature
nhiều	a lot of
nhìn	to look
nhỏ	small
nhớ	to miss; to remember; to recall
nhóm	group
như	as; like
như nhau	same
như thế nào	how
nhưng	but
những	these; those
no	full
nó	it; he/she (younger than you)
nơi	place; location
nói chuyện	to talk
nổi tiếng	popular; famous
nội trợ	housewife
nóng	hot
nông dân	farmer
nữ	female
nữa	half
núi	mountain
nước	country; water; liquid
nước ngoài	foreign; foreign country
nướng	to grill; grilled
ở	on; in; at; to live; be located at/in
ở đâu?	at where?
ở đây	here
ô tô	car (North)
ơi	hey
ôm	to hug
ốm	sick (North);
ồn ào	noisy
ông	he; him; Mr.
ông í / ổng	he; him - a male, old enough to be your grandfather (North/South)
ông ngoại	grandfather (mother side)
ông nội	grandfather (father side)
phải	right; true; must
phải không?	right?
phạt	to punish
phát triển	to develop
phim	movie
phố	street
phở	noodle soup
phổ biến	popular; common
phòng	room
phong cảnh	scenery
phòng khách	living room
phòng ngủ	bedroom
phòng tắm	bathroom
phong tục	custom
phỏng vấn	to interview
phóng viên	reporter
phù hợp	fit; suitable
phụ nữ	women
phức tạp	complicated; complex
phục vụ	to serve
phút	minute
quá	too; excessive; past; beyond
quà	gift
quận	district
quần áo	clothes
quan hệ	relationship; connection; relation
quan tâm	to care about sb/sth
quan trọng	important
quảng cáo	advertisement; to advertise
quanh năm	all year round
quạt	fan; to fan
quay	to spin; to rotate
quay lại	to come back; to turn around
quê	countryside
quen	familiar
quên	to forget
quốc gia	nation
quốc tế	international
quốc tịch	nationality
răng	teeth
rất	very; very much
rau	vegetable
rẻ	cheap
rẽ/quẹo	to turn (North/South)
riêng	own; private; separate
rõ	clearly
rồi	already
rộng	wide; large; broad
rừng	forest
rưỡi	half
rượu	wine; alcohol
sách	book
sạch	clean
sai	wrong; false
sân	yard; courtyard
sân bay	airport
sản phẩm	product
sáng	bright; morning
sao	star
sắp	forthcoming; about to
sắp xếp	to sort; to arrage
sâu	deep
sau	after; next; behind
sau đó	after that
sau khi	after doing sth
say	drunk
sẽ	will
siêu thị	supermarket
sinh nhật	birthday
sinh viên	undergraduate
số	number
sợ	to fear; to be afraid
số điện thoại	phone number
sổ mũi	to have a runny nose
sở thích	hobby
sớm	early
sông	river
sống	to live; raw; live
sốt	fever; to have a fever
sử dụng	to use
sự kiện	event
sữa	milk
sửa	to fix; to repair
sức khoẻ	health
tắc đường	traffic jam
tai	ear
tại	at; in; due to…; because
tai nạn	accident
tại sao?	why?
tắm	to shower
tạm biệt	goodbye
tặng	to give (gift); to donate
tầng trệt	first floor; ground floor (South)
táo	apple
tạp chí	magazine
tập thể dục	to workout
tập trung	to concentrate
tắt	to turn off
tất / vớ	socks (North/South)
tất cả	all
tất nhiên	of course
tàu hoả / xe lửa	train (North/South)
tàu thuỷ	ship
tên	name
Tết	Vietnamese New Year
thăm	to visit
thậm chí	even
tham gia	to take part; to participate
tham quan	to do sightseeing
thân	to be close to sb
thân mật	to be intimate
tháng	month
thẳng	straight
thang máy	lift; elevator
thành công	to succeed
thành phố	city
thảo luận	to discuss
thấp	short; low
thật	real; genuine
thay	to change something
thấy	to see
thay đổi	to alter; to modify; to change
thầy giáo	male teacher
thế à? / vậy hả	really? (North/South)
thế giới	world
thể thao	sport
thế thì	in that case
thêm	to add sth to sth; another; more
theo	to follow; according to
thi	to take a test
thị trường	market
thích	to like; to enjoy
thiên nhiên	nature
thiết kế	design; to design
thiếu	to be short of…; missing
thỉnh thoảng	sometimes; occasionally
thịt	meat
thoải mái	comfortable
thời gian	time
thời tiết	weather
thơm	scented; fragrant; aromatic
thông cảm	to sympathize
thông minh	clever; intelligent
thông thường	normally; generally
thông tin	information
thư	letter
thứ	stuff; thing; day of the week
thử	to try on
thủ đô	capital
thư ký	secretary; clerk
thu nhập	income
thủ tục	procedure
thú vị	exciting
thư viện	library
thua	to lose; to be defeated
thuận tiện	convenient
thức ăn	foods
thức dậy	to wake up
thực đơn	menu
thực hiện	to perform; to execute
thức khuya	to stay up late
thực phẩm	food product
thực tế	reality
thuê	to rent
thuốc	medicine; drug
thuốc lá	cigarette
thương	to love; to pity
thường	often
thương gia	trader
thương mại	trade
thường xuyên	regularly; frequently
ti vi	television
tiếc	to regret; to be sorry
tiệm	shop
tiền	money
tiện	convenient
tiện nghi	comfortable & convenient (place)
tiếng	hour; sound; language
tiếng Anh	English
tiếng ồn	noise
tiếng Việt	Vietnamese language
tiếp theo	next
tiếp tục	continue
tiểu thuyết	novel
tìm	to find
tin	to believe; to trust
tính	to calculate
tỉnh	province
tô	bowl
tờ	sheet
to / bự	big (North/South)
tổ chức	organization; to organize
toán	math
tóc	hair
tôi	I; me (formal)
tối	dark
tỏi	garlic
tôm	shrimp
tổng số	total; total number of...
tốt	good; kind
tốt nghiệp	to graduate
trà	tea
trả	to return; to give back; to pay
trả lời	to answer
trái/quả	fruit (North/South)
trăm	hundred
trận đấu	match; competition; contest
trang	page
trắng	white
tranh	drawing; picture
tre	bamboo
trễ	late
trẻ	young
trên	on; in; above; over
triệu	million
trò chơi	game
trở lại	to come back
trở thành	to become
trời	sky; heaven; weather
trong	in; within; clear
trừ	to minus
trưa	noon
trực tiếp	live; directly
trứng	egg
trung bình	medium; average
trung tâm	center; centre; central
trước	before; prior; front
trước đây	previously; formerly
trước khi	before doing sth
trường	school
truyền thông	the media
từ	from
tự	self
từ điển	dictionary
tự hỏi	to wonder; to ask oneself
tủ lạnh	fridge
tuần	week
từng	used to
tươi	fresh
tường	wall
tương lai	future
tương tự	similar; similarly
tuy	though; although; despite
tuy nhiên	however; but; yet
tuyết	snow
tuyệt	excellent; wonderful
ừ	yes; all right; Ok
ung thư	cancer
uống	to drink
và	and
vải	fabric
vẫn	still
vấn đề	problem
văn hoá	culture
văn phòng	office
vàng	gold; yellow
vào	to enter
vất vả	hard; strenuous; laborious
vay	to borrow money
vậy	so…
vé	ticket
về	about
vẽ	to paint
vì	because of; due to...
ví (tiền)	wallet
vị trí	location
việc	job; work
viêm họng	sore throat
viết	to write
Việt Nam	Vietnam
vịnh	bay
vỡ	to break
vợ	wife
với	with
vốn	capital
vừa	to fit (clothes)
vui	fun; joyful
vui tính	funny (person)
vườn	garden
vượt qua	to overcome
xa	far; distant; remote
xã hội	society
xác định	to determine
xanh dương	blue
xanh lá	green
xấu	bad; ugly
xây (dựng)	to build
xảy ra	to happen; to occur
xe buýt	bus
xe đạp	bicycle
xe hơi	car (South)
xe máy	motorbike
xe tải	truck
xem	to see; to watch
xem phim	to watch movie
xem xét	to consider
xếp hàng	to stand in line
xích lô	cyclo
xin lỗi	sorry
xin phép	to ask permission; to ask leave
xinh	pretty
xoài	mango
xong	to end; to finish
xuất hiện	to appear
xuất khẩu	to export; exported
xung quanh	around; surrounding
xuống	to go down; to get down
ý nghĩa	meaning
y tá	nurse
ý tưởng	idea
yên tĩnh	quiet
yêu	to love
yếu	weak
`
export const quiz = [] as Array<QuizItem>

export function restartQuiz() {
  quiz.length = 0
  quiz.push(...shuffle(seedrandom(), quizRaw.trim().split('\n').map(item => {
    const x = item.split('\t')
    return {
      answer: x[0].trim(),
      question: x[1].trim()
    } as QuizItem
  })//.filter(x => popular.indexOf(x.answer) !== -1)
  ).slice(0, settings.count)) //).slice(0, Math.ceil(popular.length / 2)))
}

restartQuiz()