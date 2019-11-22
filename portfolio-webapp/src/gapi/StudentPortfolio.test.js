import StudentPortfolio from './StudentPortfolio.js';
import mockSheets from './__mocks__/mockSheets.js';

function sleep (n) {
    return new Promise ((resolve,reject)=>{
        window.setTimeout(()=>resolve(),n)
    });
}

jest.mock('./DocumentManager.js')
jest.mock('./SheetManager.js')
jest.mock('./SheetBasics.js')

const stu = {
    userId:'stu',
    profile:{
        name: {
            fullName:'Joe Shmoe'
        }
    }
}

it('access and write to empty portfolio',()=>{

    const sp = StudentPortfolio({id:'empty'},stu,true);

    async function getPortfolio () {
         const portfolio = await sp.get_portfolio_data()
         expect(portfolio.data).toBeDefined();
         expect(portfolio.data.length).toEqual(0)
         expect(portfolio.updatedTimes).toBeDefined()
         expect(portfolio.updatedTimes.exemplars).toBeDefined()
         expect(portfolio.updatedTimes.assessments).toBeUndefined()
         return portfolio
     }

    async function getEmptyThenFill () {
        const portfolio = await getPortfolio()
        //await sleep(1000);
        await sp.set_portfolio_and_assessments(
            {...portfolio,
             data:[{courseworkId:'aaa',
                    skill:'baking',
                    reflection:'<p>Some reflection</p>',
                   }]}
        );
        const newData = await sp.get_portfolio_data();
        expect(newData.data.length).toEqual(1);
    }
    return getEmptyThenFill();
});


it('merges assessments', ()=>{
    const sp = StudentPortfolio({id:'basic'},stu,true);
    async function getPortfolio () {
        const portfolio = await sp.get_portfolio_data();
        expect(portfolio.data).toBeDefined();
        expect(portfolio.data.length).toEqual(2);
        expect(portfolio.data[0].courseworkId).toEqual('abc');
        expect(portfolio.data[0].assessment.comment).toEqual('good');
        expect(portfolio.data[0].assessment.score).toEqual('B');
        expect(portfolio.updatedTimes).toBeDefined();
        expect(portfolio.updatedTimes.exemplars).toBeDefined();
        expect(portfolio.updatedTimes.assessments).toBeDefined();
    }

    return getPortfolio();
});

it('writes assessments', ()=>{
    const sp = StudentPortfolio({id:'basic'},stu,false);
    async function writeToPortfolio () {
        const portfolio = await sp.get_portfolio_data();
        expect(portfolio.data.length).toEqual(2)
        expect(portfolio.data[1].id).toEqual('not-graded');
        expect(portfolio.data[1].assessment).toBeUndefined();
        portfolio.data[1].assessment = {
            comment : 'hello',
            score : 100
        }
        await sp.set_portfolio_and_assessments(
            portfolio
        );
        
        const newData = await sp.get_portfolio_data();
        expect(newData.data.length).toEqual(2);
        expect(newData.data[1].assessment).toBeDefined();
        expect(newData.data[1].assessment.comment).toEqual('hello');
        expect(newData.data[1].assessment.score).toEqual(100);
    }
    return writeToPortfolio();
});


it('adds assessment not in exemplar list', () => {
    const sp = StudentPortfolio({id:'mergeA'},stu,true);
    async function getPortfolio () {
        const portfolio = await sp.get_portfolio_data();
        expect(portfolio.data).toBeDefined();
        expect(portfolio.data[0].courseworkId).toEqual('abc');
        expect(portfolio.data[0].assessment.comment).toEqual('good');
        expect(portfolio.data[0].assessment.score).toEqual('B');
        expect(portfolio.updatedTimes).toBeDefined();
        expect(portfolio.updatedTimes.exemplars).toBeDefined();
        expect(portfolio.updatedTimes.assessments).toBeDefined();
        expect(portfolio.data.length).toEqual(3);
        expect(portfolio.data[2].id).toEqual('new')
        expect(portfolio.data[2].assessment.comment).toEqual('wow')
        expect(portfolio.data[2].courseWorkId).toEqual('abc')
    }
    return getPortfolio();
})
