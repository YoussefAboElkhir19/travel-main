<!DOCTYPE html>
<html>

<head>
    <title>Users</title>
</head>

<body>
    <h1>Users List</h1>
    <ul>
        @foreach($todos as $todo)
        <li>{{ $todo->task }}</li>
        @endforeach
    </ul>
</body>

</html>