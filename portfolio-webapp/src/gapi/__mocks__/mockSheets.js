const mockSheets = {
    'student-portfolio-stu-empty' : {
        json : {
            exemplars : [],
        },
        updated : new Date()
    },

    'student-portfolio-stu-basic' : {
        json : {
            exemplars : [
                {
                    id : '2',
                    skill : 'eat',
                    courseworkId : 'abc',
                    permalink : 'foo',
                },
                {
                    id : 'not-graded',
                    skill : 'eat',
                    courseworkId : 'foo',
                    permalink : 'boo',
                },
            ],
        },
        
    },

    'portfolio-assessment-stu-basic' : {
        json : {
            assessments : [
                {
                    id : '2',
                    comment : 'good',
                    score : 'B',
                }
                
            ],
        },
    },
}

mockSheets['student-portfolio-stu-mergeA'] = {...mockSheets['student-portfolio-stu-basic']},
mockSheets['portfolio-assessment-stu-mergeA'] = {
        json : {
            assessments : [
                ...mockSheets['portfolio-assessment-stu-basic'].json.assessments,
                {
                    id : 'new',
                    comment : 'wow',
                    score : 'go you',
                    courseWorkId : 'abc',
                    skill : 'foo',
                },
            ]
        }
};


var id = 0

Object.values(mockSheets).forEach(
    (val) => {
        val.id = 'id'+id;
        if (!val.updated) {
            val.updated = new Date()
        }
        mockSheets[val.id] = val;
        id += 1;
    }
); // convenience...

export default mockSheets;
