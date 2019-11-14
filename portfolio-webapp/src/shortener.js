function Shortener ({maxLength=5,idDigits=2, enforceUnique=true}) {

    const idsUsed = {}
    
    function truncateTo (s, length) {
        const truncateMethods = [
            /* https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case */
            (s) => s.replace(/(?:^\w|[A-Z]|\b\w)/g,(word,index)=>word.toUpperCase()).replace(/\s+/g,''), // remove spaces
            (s) => s.replace(/(the|of|and|ing|ed)/g,''), // remove short words
            (s) => s.replace(/[,:;~.?-]/g,''), // remove punctuation
            (s) => s.replace(/(?=\w)[aeiou]/,''), // remove a vowel
            (s) => s.replace(/(?=\w)[aeiou]/,''), // remove a vowel
            (s) => s.replace(/(?=\w)[aeiou]/,''), // remove a vowel
            (s) => s.replace(/(?=\w)[aeiou]/,''), // remove a vowel
            (s) => s.replace(/(?=\w)[aeiou]/g,''), // remove all the vowels
        ];
        var count = 1;
        for (var truncateMethod of truncateMethods) {
            count += 1;
            if (s.length < length) {
                return s
            }
            s = truncateMethod(s,length);
        }
        if (s.length <= length) {
            return s
        }
        else {
            return s.substr(0,length);
        }
    }

    return {
        shorten : function (s) {
            if (s.length <= maxLength && !enforceUnique) {return s}
            if (s.length <= maxLength && !idsUsed[s]) {
                idsUsed[s] = true;
                return s;
            }
            if (!enforceUnique) {
                return truncateTo(s,maxLength);
            }
            else {
                var id = truncateTo(s,maxLength);
                if (!idsUsed[id]) {
                    //console.log('Not used yet...');
                    idsUsed[id] = true
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

export default Shortener;
