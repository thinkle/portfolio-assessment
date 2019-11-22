import mockSheets from './mockSheets.js';

function propname (courseId, prop, student) {
    if (student) {
        return `${prop}-${student}-${courseId}`;
    }
    else {
        return `${prop}-${courseId}`;
    }
}


function DocumentManagerMock () {

    return {
        getSheetUrl () {
            return 'https://fake.url/foo'
        },
        getSheetId (courseId, prop, studentId) {
            const fullprop = propname(courseId,prop,studentId)
            if (mockSheets[fullprop]) {
                return mockSheets[fullprop].id
            }
            
        },
        async createStudentSheet (course, student, prop, title, sheets, studentWrite) {
            const fullprop = propname(course.id,prop,student.userId)
            return {}
        },
        async createSheetForProp (course, prop, title, sheets) {
            return {}
        },
        async getUpdateTime (courseId, prop, studentId) {
            const fullprop = propname(courseId,prop,studentId)
            if (mockSheets[fullprop]) {
                return mockSheets[fullprop].updated
            }
        },
        async addMetadataToFile (id, course, prop, student) {
            return {id:id}
        },
        
    }
}

export default DocumentManagerMock;
