const mockSheets = {
    'student-portfolio-test-student-empty' : {
        id : '1',
        json : {
            exemplars : [],
            assessments : [],
        },
        updated : new Date()
    }
}

Object.values(mockSheets).forEach(
    (val) => {
        mockSheets[val.id] = val;
    }
); // convenience...

export default mockSheets;
