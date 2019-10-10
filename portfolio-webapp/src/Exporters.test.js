import Exporters from './Exporters.js';

it('some name',()=>{
    const Aspen = Exporters.Aspen;
    const skills = [{
        skill:'knife skills',
        points:100,
        strand:'KTCHN'
    },{
        skill:'knife skills',
        points:100,
        strand:'KTCHN'
    },{
        skill:'knife skills',
        points:100,
        strand:'KTCHN'
    },{
        skill:'knife skills',
        points:100,
        strand:'KTCHN'
    },{
        skill:'saute skills',
        points:100,
        strand:'KTCHN'
    },{
        skill:'saute skills',
        points:100,
        strand:'KTCHN'
    },{
        skill:'boiling skills',
        points:100,
        strand:'KTCHN'
    },{
        skill:'boiling skills',
        points:100,
        strand:'KTCHN'
    },
                    {
                        skill:'boiling skills',
                        points:100,
                        strand:'KTCHN'
                    }]
    
    const portfolio = [
        {skill:'saute skills',
         assessment : {
             grade : 'A+',
             comment: 'good knife job'
         }
        },
        {skill:'knife skills',
         assessment : {
             grade : 'B+',
             comment: 'good knife job'
         }
        },

        {skill:'boiling skills',
         assessment : {
             grade : 'B+',
             comment: 'good job'
         }
        },
        {skill:'knife skills',
         assessment : {
             grade : 'C+',
             comment: 'good knife job'
         }
        },
        {skill:'boiling skills',
         assessment : {
             grade : 'B+',
             comment: 'good job'
         }
        },
        {skill:'boiling skills',
         assessment : {
             grade : 'D+',
             comment: 'good job'
         }
        },
        {skill:'boiling skills',
         assessment : {
             grade : 'F-',
             comment: 'good job'
         }
        },
        {skill:'boiling skills',
         assessment : {
             grade : 'B+',
             comment: 'good job'
         }
        },
        {skill:'boiling skills',
         assessment : {
             grade : 'A-',
             comment: 'good job'
         }
        },
        {skill:'boiling skills',
         assessment : {
             grade : 'D-',
             comment: 'good job'
         }
        },
        {skill:'boiling skills',
         assessment : {
             grade : 'A+',
             comment: 'good job with your A+ work superstar!'
         }
        },                ];
    
    const student = {
        profile : {
            name : {
                givenName : 'Mary',
                familyName : 'Test',
            }
        }
    }

    Aspen.skillsToAspenAssignments(skills);
    Aspen.studentPortfolioToAspenGrades(student,portfolio);

    
});
   

