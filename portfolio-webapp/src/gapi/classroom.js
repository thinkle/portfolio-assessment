function cr () {
    return window.gapi.client.classroom
}

const Classroom = {
    get_teacher_classes ({teacher}) {
        var params = {
            pageSize:25,
            courseStates:['ACTIVE'],
            teacherId:teacher
        };
        return Classroom.fetchAll(cr().courses.list,params,'courses');
    },

    get_student_classes () {
        var params = {
            pageSize:25,
            courseStates:['ACTIVE'],
        };
        return Classroom.fetchAll(cr().courses.list,params,'courses');
    },

    get_coursework ({course, teacherMode}) {
        const params = {
            courseId:course.id,
            pageSize:50,
        }
        return Classroom.fetchAll(
            cr().courses.courseWork.list,
            params,
            'courseWork'
        );
    },

    get_student_work ({course, coursework, student, teacherMode}) {
        const params = {
            courseId:course.id,
            courseWorkId:coursework&&coursework.id||'-',
        }
        if (!teacherMode) {
            params.userId = 'me';
        }
        else if (student) {
            params.userId = student.userId
        }
        return Classroom.fetchAll(cr().courses.courseWork.studentSubmissions.list,
                        params,'studentSubmissions');
    },

    async get_student_profile () {
        const params = {
            userId : 'me',
        }
        var resp = await cr().userProfiles.get({userId:'me'})
        return resp.result;
    },

    get_students ({course}) {
        const params = {
            courseId:course.id,
        }
        return Classroom.fetchAll(cr().courses.students.list, params, 'students');
    },

    async fetchAll (method, params, arrayName) {
        var response = await method(params);
        if (!response.result) {
            throw `No result returned in response ${response}`
        }
        var resultArray = response.result[arrayName]
        if (!resultArray) {
            console.log(`weird, result has no property ${arrayName}: ${response.result}`);
            return [];
        }
        while (response.nextPageToken) {
            console.log('fetchAll getting another page...',method);
            params.pageToken = response.nextPageToken;
            console.log('New token = %s',params.pageToken);
            var response = await method(params);
            response[arrayName].forEach((itm)=>resultArray.push(itm));
        }
        console.log('fetchAll got %s results: item 1=%s',resultArray.length,JSON.stringify(resultArray.length>1 && resultArray[0]))
        return resultArray;
    }

}

export default Classroom;
