function get_teacher_classes (teacher) {
    var resp = Classroom.Courses.list(
        {teacherId:teacher,
         courseStates : ['ACTIVE'],
         pageSize: 25}
    ); // assume <25 classes (lazy)
    return resp.courses
}

function test_get_teacher_classes () {
    var results = get_teacher_classes('thinkle@innovationcharter.org')
    Logger.log('Got %s results: %s',results.length, results);
}

functions.get_teacher_classes = get_teacher_classes;
tests.get_teacher_classes = test_get_teacher_classes;
