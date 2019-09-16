function cr () {
    return window.gapi.client.classroom
}

const Classroom = {
    get_teacher_classes (teacher) {
        var params = {
            pageSize:25,
            courseStates:['ACTIVE'],
            teacherId:teacher
        };
        return this.fetchAll(cr().courses.list,params,'courses');
    },

    get_coursework (course) {
        const params = {
            courseId:course.id,
            pageSize:50,
        }
        return this.fetchAll(
            cr().courses.courseWork.list,
            params,
            'courseWork'
        );
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
            var response = await method(params);
            response[arrayName].forEach((itm)=>resultArray.push(itm));
        }
        console.log('fetchAll got %s results: item 1=%s',resultArray.length,JSON.stringify(resultArray.length>1 && resultArray[0]))
        return resultArray;
    }

}

export default Classroom;
