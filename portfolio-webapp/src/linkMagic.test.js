import MagicLink,{makeIframable} from './linkMagic.js';

it('google drive match',
   ()=>{
       expect(MagicLink.gdrive.isMatch('https://drive.google.com/open?id=1riCPWUg9zz4Y4wYS9ccXRGl-N7k9-KgDff')).toBeTruthy()
   });

it('google drive iframeable',
   ()=>{
       const id = '1riCPWUg9zz4Y4wYS9ccXRGl-N7k9-KgD';
       expect(makeIframable('https://drive.google.com/open?id=1riCPWUg9zz4Y4wYS9ccXRGl-N7k9-KgD'))
           .toBe(`https://drive.google.com/file/d/${id}/preview`);
   });
it('trinket matcher',
   ()=>{
       expect(MagicLink.trinket.isMatch('https://trinket.io/python/f722d5dd02'))
              .toBeTruthy()
   });

it('trinket conversion',
   ()=>{
       expect(MagicLink.trinket.makeIframable('https://trinket.io/library/trinkets/f722d5dd02'))
           .toBe('https://trinket.io/embed/python/f722d5dd02');
       expect(MagicLink.trinket.makeIframable('https://trinket.io/python/f722d5dd02'))
           .toBe('https://trinket.io/embed/python/f722d5dd02');

   });
