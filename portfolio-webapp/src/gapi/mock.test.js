import Mock from './mock.js';

var m;

beforeEach(()=> {
        expect(Mock).toBeDefined()
        var data = [
            {name : 'foo.bar.baz',
             args : [{id:1,name:28}],
             response : [{say:'hi'}]
            },
            {name : 'foo.bar.bang',
             args : [{id:1,name:28}],
             response : [{say:'hi'}]
            },
            {name : 'foo.baz.boop.beep',
             args : [{id:1,name:28}],
             response : [{say:'hi'}]
            },
            {name : 'foo.baz.boop.insta',
             args : ['hi'],
             retVal : 'howdy'
            },
            {name : 'foo.init',
             args : [],
             response : {complete:true,signedIn:true},
            },
            {name : 'foo.argtest',
             args : ['boop'],
             retVal : 'boop'},
            {name : 'foo.argtest',
             args : ['bap','bang'],
             retVal : 'bapbang'},
            {name : 'foo.argtest',
             args : ['bap'],
             retVal : 'just bap'},
            {name : 'foo.argtest',
             args : ['promise'],
             response : 'I do'},
            {name : 'foo.arg2',
             args : [],
             retVal : 'I rule everything'},
            {name : 'foo.arg2',
             args : ['I','have','three'],
             retVal : 3},
            {name : 'foo.arg2',
             args: ['hi'],
             retVal : 'hi back'},
            {name : 'foo.argobj',
             args: [{hi:'there'}],
             retVal : 'hi'},
            {name : 'foo.argobj',
             args: [{hi:'there',name:'Joe'}],
             retVal : 'hi Joe'},
            {name : 'foo.argobj',
             args: [{hi:'there',name:'Joe',age:70}],
             retVal : 'hi old guy'},
            {name : 'foo.argobj',
             args: [{}],
             retVal : 'empty'},


        ];
        
        m = Mock(data)
});

it('create mock',
    ()=>{
        expect(m.foo).toBeDefined();
        expect(m.foo.bar).toBeDefined();
        expect(m.foo.baz.boop.beep).toBeDefined();
    });

it('Define methods',
   ()=>{
       expect(typeof m.foo.bar.baz).toBe('function');
       expect(typeof m.foo.bar.bang).toBe('function');
       expect(typeof m.foo.baz.boop.beep).toBe('function');
       expect(m.foo.bar.baz({id:1,name:28}).then).toBeDefined();
   });

it('Run methods - get promises or return values',
   async () => {
       var val = await m.foo.bar.baz({id:1,name:28});
       expect(val).toEqual([{say:'hi'}])
       expect(m.foo.baz.boop.insta('hi')).toEqual('howdy');
   }
  );


it('Run methods with different args',
   async ()=>{
       expect(m.foo.argtest('boop')).toEqual('boop')
       expect(m.foo.argtest('bap','bang')).toEqual('bapbang')
       expect(m.foo.argtest('bap')).toEqual('just bap')
       var val = await m.foo.argtest('promise');
       expect(val).toEqual('I do');
       // wuh wuh...
       expect(m.foo.arg2('hi')).toEqual('hi back');
       expect(m.foo.arg2()).toEqual('I rule everything');
       expect(m.foo.arg2('something else')).toEqual('I rule everything');
       expect(m.foo.argobj({hi:'there',name:'Joe',age:70})).toEqual('hi old guy')
       expect(m.foo.argobj({})).toEqual('empty')
       expect(m.foo.argobj({hi:'there'})).toEqual('hi')
   });

it('Get custom exception with bad args',
   async () => {
       var gotVal, gotError;
       await m.foo.bar.baz({id:2,name:29})
           .then((resp)=>{gotVal=resp})
           .catch((err)=>{gotError=err});
       expect(gotVal).toEqual(undefined)
       expect(gotError.type).toEqual('mockError')
       expect(gotError.arguments[0].id).toEqual(2)
       expect(gotError.arguments[0].name).toEqual(29)
   });
