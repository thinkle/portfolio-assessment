function Shortener (maxLength,{idDigits=2, enforceUnique=true}) {

    const idsUsed = {}
    
    function truncateTo (s, length) {
        const truncateMethods = [
            (s) => s.replace(/[,.:;-~]/g,''), // remove punctuation
            (s) => s.replace(/\s+/g,''), // remove spaces
            (s) => s.replace(/(?=\w)[aeiou]/g,''), // remove vowels
        ];
        for (var truncateMethod of truncateMethods) {
            console.log('method 1');
            if (s.length < length) {
                return s
            }
            s = truncateMethod(s,length);
        }
        if (s.length < length) {
            return s
        }
        else {
            return s.substr(0,length);
        }
    }

    return {
        shorten : function (s) {
            if (s.length < maxLength && !enforceUnique) {return s}
            if (s.length < maxLength && !idsUsed[s]) {
                idsUsed[s] = true;
                return s;
            }
            if (!enforceUnique) {
                return truncateTo(s,maxLength);
            }
            else {
                var id = truncateTo(s,maxLength);
                if (!idsUsed[s]) {
                    return id;
                }
                else {
                    var shortId = truncateTo(s,maxLength-idDigits);
                    // going for human readable numbers on these IDs
                    // -- we could obviously squeeze in more numbers
                    // with hex or something better.
                    if (!idsUsed[shortId]) {
                        idsUsed[shortId] = 1
                    }
                    else {
                        idsUsed[shortId] += 1
                    }
                    return `${shortId}${(""+(idsUsed[shortId])).padStart(idDigits,"0")}`
                }
            }
        }
    }
}

function test () {
    sh = Shortener(5)
    for (var i=0; i<10; i++) {console.log(sh.shorten('hello world'))}
}

test();

export default Shortener;
