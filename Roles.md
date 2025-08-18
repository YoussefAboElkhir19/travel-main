 Sidebar هيشتغل كده:
✅ لـ User بـ 
## role = "admin":

هيشوف كل حاجة تقريباً لأن معظم العناصر فيها 'admin' في الـ roles
Dashboard ✅
All Employee stuff ✅
External Links ✅
Bookings Section ✅
Administration Section ✅ (User Management, Settings, إلخ...)

## =================================================================
✅ لـ User بـ 
## role = "employee":

Dashboard ❌ (مش في الـ roles بتاعته)
Shift Attendance ✅
Leave Requests ✅
My Reservations ✅
To Do List ✅
Webmail ✅
External Links ✅
Bookings Section ✅
Administration Section ❌ (إلا Profile بس)
## =================================================================
✅ لـ User بـ 
## role = "manager":

Dashboard ✅
كل حاجة الـ employee يشوفها ✅
Administration Section ✅ (إلا User Management)
## =================================================================
## ********************** To Start App ************************
## composer u  
## Push Data By Seeder
## php artisan db:seed --class=CompanySeeder
## php artisan db:seed --class=AdminUserSeeder

## =================================================================

## Delete Table
## TRUNCATE TABLE companies;
