import Shortener from './shortener.js';
import {gradeToNum} from './utils.js';

var Aspen = {

    getShorteners () {
        if (!this.gbShortener || !this.assignmentShortener) {
            this.gbShortener = Shortener({maxLength:10})
            this.assignmentShortener = Shortener({maxLength:50})
        }
    },

    skillsToAspenAssignments (skillsList, params={}) {
        this.skillToAssignmentMap = {}
        this.getShorteners();
        var gbShortener = this.gbShortener
        var assignmentShortener = this.assignmentShortener

        const mapper = {
            'GB column name':(row)=>gbShortener.shorten(row.skill),
            'Assignment name':(row)=>assignmentShortener.shorten(row.skill),
            'Category':(row)=>row.strand,
            'Date assigned':(row)=>row.assignedDate,
            'Date due':(row)=>row.dueDate,
            'Total points':(row)=>row.points,
            'Extra credit points':(row)=>params.extraCredit||0,
            'Grade Scale':(row)=>params.gradingScale||'Current High School Grading Scale',
            'Grade Term':(row)=>params.semester||'S1',
        };

        var aspenList = skillsList.map(
            (row)=>{
                const newRow = {}
                for (var col in mapper) {
                    const converter = mapper[col];
                    newRow[col] = converter(row);
                }
                if (!this.skillToAssignmentMap[row.skill]) {
                    this.skillToAssignmentMap[row.skill] = [];
                }
                this.skillToAssignmentMap[row.skill].push(newRow['GB column name']);
                return newRow;
            });
        console.log('Built a map: ',this.skillToAssignmentMap);
        return aspenList;
    },

    studentPortfolioToAspenGrades (student,portfolio) {
        if (!this.skillToAssignmentMap) {
            console.log('Called studentPortfolioToAspenGrades before mapping skills to assignments. You need to call skillsToAspenAssignments first. Got args: ',student,portfolio);
            throw 'Called studentPortfolioToAspenGrades before mapping skills to assignments. You need to call skillsToAspenAssignments first'
        }
        if (!student || !student.profile || !student.profile.name) {
            console.log(`Called studentPortfolioToAspenGrades without valid student object (needs profile with .name attr). Expected {profile:{name:{familyname...}}, got`,student)
            throw `Called studentPortfolioToAspenGrades without valid student object (needs profile with .name attr). Expected {profile:{name:{familyname...}}, got ${student}`
        }
        const studentName = fixName(student.profile.name);
        const assignmentsBySkill = {}
        portfolio.forEach(
            (exemplar) => {
                if (exemplar.assessment && exemplar.assessment.score) {
                    if (!assignmentsBySkill[exemplar.skill]) {
                        assignmentsBySkill[exemplar.skill] = []
                    }
                    assignmentsBySkill[exemplar.skill].push(exemplar);
                }
            }
        );
        // Organized by skill
        console.log('Organized portfolio by skill',assignmentsBySkill);
        var gradeExport = []
        for (var skill in assignmentsBySkill) {
            // Sort our items by grade...
            var exemplars = assignmentsBySkill[skill]
            exemplars.sort(
                (a,b)=>gradeToNum(a.assessment.score)-gradeToNum(b.assessment.score) // sort by grade
            );
            console.log('Sorted by grade!',
                        exemplars.map((ex)=>`${ex.skill} ${ex.assessment.score}`)
                       );
            //console.log('Working with ',this.skillToAssignmentMap);
            //console.log('Working with skill',skill);
            var assignments = this.skillToAssignmentMap[skill];
            //console.log('Working with ',this.skillToAssignmentMap[skill]);
            for (var assignment of assignments) {
                if (exemplars.length > 0) {
                    var exemplar = exemplars.pop();
                    gradeExport.push(
                        {
                            'Student Name':studentName,
                            'Assignment Name':assignment,
                            'Grade':exemplar.assessment.score,
                            'Comment':makeComment(exemplar),
                        }
                    );
                }
            }
            
            
        }
        console.log('EXP: Began with portf, exporting: ',portfolio, gradeExport);
        return gradeExport;

        function fixName (name) {
            // FIX ME!
            var out;
            if (name.familyName && name.givenName) {
                out = name.familyName+', '+name.givenName;
            }
            else {
                out = name.fullName
            }
            if (out=='Landry, Jess') {  
                return 'Landry, Jessica' // REFACTOR INTO DATA SOON :)
            }
            if (out=='daphne') {
                return 'Osorio, Daphne'
            }
            return out;
        }

        function makeComment (exemplar) {
            var comment = ''
            if (exemplar.permalink) {
                comment += 'Link to work: '+exemplar.permalink;
            }
            if (exemplar.assessment.comment) {
                comment += '\nTeacher Comment: '+exemplar.assessment.comment
            }
            if (exemplar.reflection) {
                comment += '\nStudent Reflection: '+exemplar.reflection
            }
            return comment
        }
    },

    

    
}

const Exporters = {
    Aspen 
}

export default Exporters;

