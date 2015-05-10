jQuery.wordStats = {

    unsortedWords: null,
    latinOnly: true,
    sortedWords: null,
    topWords: null,
    topWeights: null,
    _computed: false,
    useStopWords: true,

    //add words from provided string to unsortedWords array
    addWords: function(str, weight) {
        if(str && str.length > 1) {
            var w = this.splitWords(str.toLowerCase());
            for(var x = 0, y = w.length; x < y; x++) {
                word = w[x];
                if(this.useStopWords == false)
                {

                }
                if(word.length > 1 && (!this.stopWords[word] || this.useStopWords == true)) {
                    //word = '_' + word;
                    if(this.unsortedWords[word])
                        this.unsortedWords[word] += weight;
                    else this.unsortedWords[word] = weight;
                }
            }
        }
    },

    //add words from text nodes only
    addWordsFromTextNodes: function(node, weight) {
        var nodes = node.childNodes;
        for(var i = 0, j = nodes.length; i < j; i++) {
            if(nodes[i].nodeType == 3) this.addWords(nodes[i].nodeValue, weight);
        }
    },

    //accept Latin-1 basic + Latin-1 extended characters
    testChar: function(c) {
        if(this.latinOnly == true)
        {
            return((c == 39) || (c >= 97 && c <= 122)
                || (c >= 128 && c <= 151)
                || (c >= 160 && c <= 164)
                || (c >= 48 && c <= 57)
                || (c >= 224 && c <= 246)
                || (c >= 249 && c <= 255));
        }
        else
        {
            return c != 32 && c != 33
                && c != 34 && c != 35
                && c != 36 && c != 37
                && c != 38 && c != 39
                && c != 40 && c != 41
                && c != 42 && c != 43
                && c != 44 && c != 45
                && c != 46 && c != 47
                && c != 58 && c != 59
                && c != 60 && c != 61
                && c != 62 && c != 63;
        }
    },

    //split words
    splitWords: function(words) {
        var w = new Array(), str = '';
        for(var i = 0, j = words.length; i < j; i++) {
            c = words.charCodeAt(i);
            if(this.testChar(c)) str += words.substring(i, i + 1);
            else {
                w.push(str);
                str = '';
            }
        }

        if(str.length > 0) w.push(str);
        return(w);
    },

    //main function: compute words from web page / element
    computeWords: function(elem) {

        if(!elem) elem = window.document;

        this.unsortedWords = new Array();

        if(elem.is("textarea"))
        {
            this.addWords(elem.val(), 1);
            return ;
        }

        this.addWords($('title', elem).text(), 20);

        wordstats = this;

        $('h1', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 15);
        });

        $('h2', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 10);
        });

        $('h3, h4, h5, h6', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 5);
        });

        $('strong, b, em, i', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 3);
        });

        $('p, div, th, td, li, a, span', elem).each(function() {
            wordstats.addWordsFromTextNodes($(this).get(0), 2);
        });

        $('img', elem).each(function() {
            wordstats.addWords($(this).attr('alt'), 1);
            wordstats.addWords($(this).attr('title'), 1);
        });

        this._computed = true;
    },

    //compute 'top' words: words which occur the most frequently
    computeTopWords: function(count, elem) {

        if(!this._computed) this.computeWords(elem);

        this.topWords = new Array();
        this.topWeights = new Array();

        this.topWeights.push(0);
        for(word in this.unsortedWords) {
            for(var i = 0; i < count; i++) {
                if(this.unsortedWords[word] > this.topWeights[i]) {
                    this.topWeights.splice(i, 0, this.unsortedWords[word]);
                    this.topWords.splice(i, 0, word);
                    break;
                }
            }
        }
    },

    //sort the unsortedWords array, based on words 'weights' descending
    sortWords: function() {
        this.sortedWords = new Array();
        //sort the associative array desc
        i = 0;
        for(word in this.unsortedWords) { this.sortedWords[i] = word; i++; }
        this.sortedWords.sort(function(a, b) {
                return wordstats.unsortedWords[b] - wordstats.unsortedWords[a];
            }
        );
    },

    //release memory
    clear: function() {
        this.unsortedWords
        = this.sortedWords
        = this.topWords
        = this.topWeights
        = null;
        this._computed = false;
    }
};

/* jQuery wordStats plugin: tries to determine what a page is about
 * by computing the density of its keywords
 * Copyright (C) 2007 Jean-Francois Hovinne - http://www.hovinne.com/
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */
 /* This file is part of the jQuery wordStats plugin
 * Copyright (C) 2007 Jean-Francois Hovinne - http://www.hovinne.com/
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */

jQuery.wordStats.stopWords = {
    "able": true,
    "about": true,
    "above": true,
    "abroad": true,
    "according": true,
    "accordingly": true,
    "across": true,
    "actually": true,
    "after": true,
    "afterwards": true,
    "again": true,
    "against": true,
    "ago": true,
    "ahead": true,
    "ain't": true,
    "all": true,
    "allow": true,
    "allows": true,
    "almost": true,
    "alone": true,
    "along": true,
    "alongside": true,
    "already": true,
    "also": true,
    "although": true,
    "always": true,
    "am": true,
    "amid": true,
    "amidst": true,
    "among": true,
    "amongst": true,
    "an": true,
    "and": true,
    "another": true,
    "any": true,
    "anybody": true,
    "anyhow": true,
    "anyone": true,
    "anything": true,
    "anyway": true,
    "anyways": true,
    "anywhere": true,
    "apart": true,
    "appear": true,
    "appreciate": true,
    "appropriate": true,
    "are": true,
    "aren't": true,
    "around": true,
    "as": true,
    "aside": true,
    "ask": true,
    "asking": true,
    "associated": true,
    "at": true,
    "available": true,
    "away": true,
    "awfully": true,
    "back": true,
    "backward": true,
    "backwards": true,
    "be": true,
    "became": true,
    "because": true,
    "become": true,
    "becomes": true,
    "becoming": true,
    "been": true,
    "before": true,
    "beforehand": true,
    "begin": true,
    "behind": true,
    "being": true,
    "believe": true,
    "below": true,
    "beside": true,
    "besides": true,
    "best": true,
    "better": true,
    "between": true,
    "beyond": true,
    "both": true,
    "brief": true,
    "but": true,
    "by": true,
    "came": true,
    "can": true,
    "cannot": true,
    "cant": true,
    "can't": true,
    "caption": true,
    "cause": true,
    "causes": true,
    "certain": true,
    "certainly": true,
    "changes": true,
    "clearly": true,
    "c'mon": true,
    "come": true,
    "comes": true,
    "concerning": true,
    "consequently": true,
    "consider": true,
    "considering": true,
    "contain": true,
    "containing": true,
    "contains": true,
    "corresponding": true,
    "could": true,
    "couldn't": true,
    "course": true,
    "currently": true,
    "dare": true,
    "daren't": true,
    "definitely": true,
    "described": true,
    "despite": true,
    "does": true,
    "doesn't": true,
    "doing": true,
    "done": true,
    "don't": true,
    "did": true,
    "didn't": true,
    "different": true,
    "directly": true,
    "do": true,
    "down": true,
    "downwards": true,
    "during": true,
    "each": true,
    "eight": true,
    "eighty": true,
    "either": true,
    "else": true,
    "elsewhere": true,
    "end": true,
    "ending": true,
    "enough": true,
    "entirely": true,
    "especially": true,
    "etc": true,
    "even": true,
    "ever": true,
    "evermore": true,
    "every": true,
    "everybody": true,
    "everyone": true,
    "everything": true,
    "everywhere": true,
    "ex": true,
    "exactly": true,
    "example": true,
    "except": true,
    "fairly": true,
    "far": true,
    "farther": true,
    "few": true,
    "fewer": true,
    "fifth": true,
    "first": true,
    "five": true,
    "followed": true,
    "following": true,
    "follows": true,
    "for": true,
    "found": true,
    "four": true,
    "from": true,
    "forever": true,
    "former": true,
    "formerly": true,
    "forth": true,
    "forward": true,
    "further": true,
    "furthermore": true,
    "get": true,
    "gets": true,
    "getting": true,
    "given": true,
    "gives": true,
    "go": true,
    "gotten": true,
    "greetings": true,
    "goes": true,
    "going": true,
    "gone": true,
    "got": true,
    "had": true,
    "hadn't": true,
    "half": true,
    "happens": true,
    "hardly": true,
    "has": true,
    "hasn't": true,
    "have": true,
    "haven't": true,
    "having": true,
    "he": true,
    "he'd": true,
    "he'll": true,
    "hello": true,
    "help": true,
    "hence": true,
    "her": true,
    "here": true,
    "hereafter": true,
    "hereby": true,
    "herein": true,
    "here's": true,
    "hereupon": true,
    "hers": true,
    "herself": true,
    "he's": true,
    "hi": true,
    "him": true,
    "himself": true,
    "his": true,
    "hither": true,
    "hopefully": true,
    "how": true,
    "however": true,
    "hudred": true,
    "i'd": true,
    "if": true,
    "ignored": true,
    "i'll": true,
    "i'm": true,
    "immediate": true,
    "in": true,
    "inc": true,
    "indeed": true,
    "ndicate": true,
    "indicated": true,
    "indicates": true,
    "inner": true,
    "inside": true,
    "instead": true,
    "into": true,
    "inward": true,
    "is": true,
    "isn't": true,
    "it": true,
    "it'd": true,
    "it'll": true,
    "its": true,
    "it's": true,
    "itself": true,
    "i've": true,
    "just": true,
    "keep": true,
    "keeps": true,
    "kept": true,
    "know": true,
    "known": true,
    "knows": true,
    "last": true,
    "lately": true,
    "later": true,
    "latter": true,
    "latterly": true,
    "least": true,
    "less": true,
    "lest": true,
    "let": true,
    "let's": true,
    "like": true,
    "liked": true,
    "likely": true,
    "likewise": true,
    "little": true,
    "look": true,
    "looking": true,
    "looks": true,
    "low": true,
    "lower": true,
    "made": true,
    "mainly": true,
    "make": true,
    "makes": true,
    "many": true,
    "may": true,
    "maybe": true,
    "mayn't": true,
    "me": true,
    "mean": true,
    "meantime": true,
    "meanwhile": true,
    "merely": true,
    "might": true,
    "mine": true,
    "minus": true,
    "miss": true,
    "more": true,
    "moreover": true,
    "most": true,
    "mostly": true,
    "mr": true,
    "mrs": true,
    "much": true,
    "must": true,
    "mustn't": true,
    "my": true,
    "myself": true,
    "name": true,
    "namely": true,
    "near": true,
    "nearly": true,
    "necessary": true,
    "ne": true,
    "needn't": true,
    "needs": true,
    "neither": true,
    "never": true,
    "neverf": true,
    "neverless": true,
    "nevertheless": true,
    "new": true,
    "next": true,
    "nine": true,
    "ninety": true,
    "no": true,
    "nobody": true,
    "non": true,
    "none": true,
    "nonetheless": true,
    "nor": true,
    "normally": true,
    "not": true,
    "nothing": true,
    "notwithstanding": true,
    "novel": true,
    "now": true,
    "nowhere": true,
    "obviously": true,
    "of": true,
    "off": true,
    "often": true,
    "oh": true,
    "ok": true,
    "okay": true,
    "old": true,
    "on": true,
    "once": true,
    "one": true,
    "ones": true,
    "one's": true,
    "only": true,
    "onto": true,
    "opposite": true,
    "or": true,
    "other": true,
    "others": true,
    "otherwise": true,
    "ought": true,
    "oughtn't": true,
    "our": true,
    "ours": true,
    "ourselves": true,
    "out": true,
    "outside": true,
    "over": true,
    "overall": true,
    "own": true,
    "particular": true,
    "particularly": true,
    "past": true,
    "per": true,
    "perhaps": true,
    "placed": true,
    "please": true,
    "plus": true,
    "possible": true,
    "presumably": true,
    "probably": true,
    "provided": true,
    "provides": true,
    "que": true,
    "quite": true,
    "rather": true,
    "really": true,
    "reasonably": true,
    "recent": true,
    "recently": true,
    "regarding": true,
    "regardless": true,
    "regards": true,
    "relatively": true,
    "respectively": true,
    "right": true,
    "round": true,
    "said": true,
    "same": true,
    "saw": true,
    "say": true,
    "saying": true,
    "says": true,
    "second": true,
    "secondly": true,
    "see": true,
    "seeing": true,
    "seem": true,
    "seemed": true,
    "seeming": true,
    "seems": true,
    "seen": true,
    "self": true,
    "selves": true,
    "sensible": true,
    "sent": true,
    "serious": true,
    "seriously": true,
    "seven": true,
    "several": true,
    "shall": true,
    "shan't": true,
    "she": true,
    "she'd": true,
    "she'll": true,
    "she's": true,
    "should": true,
    "shouldn't": true,
    "since": true,
    "six": true,
    "so": true,
    "some": true,
    "somebody": true,
    "someday": true,
    "somehow": true,
    "someone": true,
    "something": true,
    "sometime": true,
    "sometimes": true,
    "somewhat": true,
    "somewhere": true,
    "soon": true,
    "sorry": true,
    "specified": true,
    "specify": true,
    "specifying": true,
    "still": true,
    "sub": true,
    "such": true,
    "sure": true,
    "take": true,
    "taken": true,
    "taking": true,
    "tell": true,
    "tends": true,
    "than": true,
    "thank": true,
    "thanks": true,
    "thanx": true,
    "that": true,
    "that'll": true,
    "thats": true,
    "that's": true,
    "that've": true,
    "the": true,
    "their": true,
    "theirs": true,
    "them": true,
    "themselves": true,
    "then": true,
    "thence": true,
    "there": true,
    "thereafter": true,
    "thereby": true,
    "there'd": true,
    "therefore": true,
    "therein": true,
    "there'll": true,
    "there're": true,
    "theres": true,
    "there's": true,
    "thereupon": true,
    "there've": true,
    "these": true,
    "they": true,
    "they'd": true,
    "they'll": true,
    "they're": true,
    "they've": true,
    "thing": true,
    "things": true,
    "think": true,
    "third": true,
    "thirty": true,
    "this": true,
    "thorough": true,
    "thoroughly": true,
    "those": true,
    "though": true,
    "three": true,
    "through": true,
    "throughout": true,
    "thru": true,
    "thus": true,
    "till": true,
    "to": true,
    "together": true,
    "too": true,
    "took": true,
    "toward": true,
    "towards": true,
    "tried": true,
    "tries": true,
    "truly": true,
    "try": true,
    "trying": true,
    "twice": true,
    "two": true,
    "under": true,
    "underneath": true,
    "undoing": true,
    "unfortunately": true,
    "unless": true,
    "unlike": true,
    "unlikely": true,
    "until": true,
    "unto": true,
    "up": true,
    "upon": true,
    "upwards": true,
    "us": true,
    "use": true,
    "used": true,
    "useful": true,
    "uses": true,
    "using": true,
    "usually": true,
    "value": true,
    "various": true,
    "versus": true,
    "very": true,
    "via": true,
    "vs": true,
    "vs.": true,
    "want": true,
    "wants": true,
    "was": true,
    "wasn't": true,
    "way": true,
    "we": true,
    "we'd": true,
    "welcome": true,
    "well": true,
    "we'll": true,
    "went": true,
    "were": true,
    "we're": true,
    "weren't": true,
    "we've": true,
    "what": true,
    "whatever": true,
    "what'll": true,
    "what's": true,
    "what've": true,
    "when": true,
    "whence": true,
    "whenever": true,
    "where": true,
    "whereafter": true,
    "whereas": true,
    "whereby": true,
    "wherein": true,
    "where's": true,
    "whereupon": true,
    "wherever": true,
    "whether": true,
    "which": true,
    "whichever": true,
    "while": true,
    "whilst": true,
    "whither": true,
    "who": true,
    "who'd": true,
    "whoever": true,
    "whole": true,
    "who'll": true,
    "whom": true,
    "whomever": true,
    "who's": true,
    "whose": true,
    "why": true,
    "will": true,
    "willing": true,
    "wish": true,
    "with": true,
    "within": true,
    "without": true,
    "wonder": true,
    "won't": true,
    "would": true,
    "wouldn't": true,
    "yes": true,
    "yet": true,
    "you": true,
    "you'd": true,
    "you'll": true,
    "your": true,
    "you're": true,
    "yours": true,
    "yourself": true,
    "yourselves": true,
    "you've": true,
    "zero": true
};

/*
jQuery.wordStats.testChar = function(c) {
    return(c >= 97 && c <= 122);
};*/
