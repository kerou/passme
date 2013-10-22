/* ================================================================
 * passme.js v0.0.2
 *
 * parse me!
 * Latest build : 2013-10-22 18:45:17
 *
 * ================================================================
 * * Copyright (C) 2012-2013 xudafeng <xudafeng@126.com>
 * Improved from civet https://github.com/xudafeng/civet
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ================================================================ */
;(function(root,factory){
    'use strict';
    /* amd like aml https://github.com/xudafeng/aml.git */
    if(typeof define === 'function' && define.amd) {
        return define(['exports'], factory);
    }else if(typeof exports !== 'undefined') {
        return factory(exports);
    }else{
    /* browser */
        factory(root['passme'] || (root['passme'] = {}));
    }
})(this,function(exports,undefined){
    var _,
        Sytax,
        Regex,
        Token,
        Message;

    /* static */
    var EMPTY = '';

    var KEY_WORDS_AND_BOOlEAN_LITERALS_AND_NULLLITERAL = 'break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with|true|false|null'.split('|');

    var BOOlEAN_LITERALS = ['true','false'];
    
    var NULLLITERAL = ['null'];

    /* default options */
    var options = {
        ecmascript:5,
        comment:true,
        whiteSpace:false
    }

    var userConfig = {};

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    Token = {
        BooleanLiteral: 1,
        Identifier: 2,
        Keyword: 3,
        NullLiteral: 4,
        NumericLiteral: 5,
        Punctuator: 6,
        StringLiteral: 7,
        RegularExpression: 8,
        Comment:9,
        WhiteSpace:10
    };
    /* map for type */

    Token['BooleanLiteral'] = 'BooleanLiteral';
    Token['Identifier'] = 'Identifier';
    Token['Keyword'] = 'Keyword';
    Token['NullLiteral'] = 'NullLiteral';
    Token['NumericLiteral'] = 'NumericLiteral';
    Token['Punctuator'] = 'Punctuator';
    Token['StringLiteral'] = 'StringLiteral';
    Token['RegularExpression'] = 'RegularExpression';
    Token['Comment'] = 'Comment';
    Token['WhiteSpace'] = 'WhiteSpace';

    Message = {};

    /**
     * util
     */

    function __(){};
    function __typeof(type){
        return function(obj){
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        };
    }
    __.prototype = {
        log:function (l){
            console && this.isObject(console.log) && console.log(l);
        },
        indexOf:function(item, arr) {
            for (var i = 0, len = arr.length; i < len; ++i) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        inArray:function(item, arr) {
            return this.indexOf(item, arr) > -1;
        },
        isIn:function(i,s){
            return !!~s.indexOf(i);
        },
        mix:function(r,s){
            for(var i in s){
                r[i] = s[i];
            };
            return r;
        },
        each:function(object, fn) {
            if(object){
                for(var i in object){
                    if(i !== 'length' && i !== 'item' && object.hasOwnProperty(i)){
                        fn.call(this,object[i],i);
                    }
                }
            }
            return object;
        },
        isString:function(){
            return __typeof('String');
        },
        isArray:function(){
            return __typeof('Array');
        },
        isObject:function(){
            return __typeof('Object');
        },
        isFunction:function(){
            return __typeof('Function');
        },
        isUndefined:function(){
            return __typeof('Undefined');
        }
    };
    exports._ = _ = new __();
    /* lexicalParse class */
    function LexAnalyzer(cfg){
        this.source = cfg.code;
        return this.init();
    }
    LexAnalyzer.prototype = {
        init:function(){
            var that = this;
            that.initIndex();
            that.initFlags();
            that.scanner();
            return this.tokens;
        },
        initIndex:function(){
            var that = this;
            that.length = that.source.length;
            that.index = 0;
        },
        initFlags:function(){
            var that = this;
            that.tokens = [];
            that.clearFlags();
        },
        initType:function(){
            var that = this;
            if(that.isWhiteSpace()){
                that.type = Token['WhiteSpace'];
            }else if(that.isIdentifier()){
                that.type = Token['Identifier'];
            }else if(that.isRegularExpression()){
                that.type = Token['RegularExpression'];
            }else if(that.isPunctuator()){
                that.type = Token['Punctuator'];
            }else if(that.isNumericLiteral()){
                that.type = Token['NumericLiteral'];
            }else if(that.isStringLiteral()){
                that.type = Token['StringLiteral'];
            }
            that.token += that.char;
        },
        clearFlags:function(){
            var that = this;
            that.token = EMPTY;
            that.type = null;
        },
        scanner:function(){
            var that = this;
            _.each(that.source,function(){
                that.getChar();
                that.getToken();
            });
        },
        getChar:function(){
            var that = this;
            that.char = that.source[that.index];
            that.index ++;
            //that.char = that.source.charCodeAt(that.index);
        },
        end:function(){
            var that = this;
            if(that.index === that.length){
                that.validate();
            }
        },
        isBooleanLiteral:function(){
            var t = this.token;
            return _.isIn(t,BOOlEAN_LITERALS);
        },
        isIdentifier:function(){
            var that = this;
            var c = that.char;
            var hasInitialWord = !!that.token;
            return hasInitialWord ? (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c === '_' || c === '$') : (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' || c === '$');
        },
        isKeyword:function(){
            var t = this.token;
            var r;
            if(_.isIn(t[0],'bcdefinrstvw')){
                /** 
                 * javascript es5 Keywords:
                 * break 
                 * case catch continue 
                 * default delete do 
                 * else 
                 * finally for function 
                 * if in instanceof 
                 * new 
                 * return 
                 * switch 
                 * this throw try typeof 
                 * var void 
                 * while with
                 */
                if(_.isIn(t,KEY_WORDS_AND_BOOlEAN_LITERALS_AND_NULLLITERAL)){
                    r = !r;
                }else{
                    r = !!r;
                }
            }else {
                r = !!r;
            }
            return r;
        },
        isNullLiteral:function(){
            var t = this.token;
            return _.isIn(t,NULLLITERAL);
        },
        isNumericLiteral:function(){
            var c = this.char;
            return c >= '0' && c <= '9';
        },
        isPunctuator:function(){
            var that = this;
            var c = that.char;
            return _.isIn(c,'+-*/%=&|!><:?~.\{\}\[\]\,\;\(\)');
        },
        isStringLiteral:function(){
            var c = this.char;
            var t = this.token;
            switch (t.length){
                case 0:
                    return c === '\''|| c === '\"';
                    break;
                case 1:
                    var _t = t[0];
                    return c !== _t || c === _t && t[t.length -1] !=='\\';
                    break;
                default :
                    var _t = t[0];
                    return t[t.length-1] !== _t || c === _t && t[t.length-1] !=='\\';
                    break;
            }
        },
        isRegularExpression:function(){
            // /pattern/attribute
            var c = this.char;
            var t = this.token;
            switch (t.length){
                case 0:
                    return c === '/';
                    break;
                case 1:
                    return c !== '/'&& c !=='*';
                    break;
                default:
                    return c !==' ' && c !== '\,' && c !== '\;';
                    break;
            }
        },
        isComment:function(){
            /** 
             * //     singel
             * /* *\/ multi
             */
            var c = this.char;
            var t = this.token;
            switch (t.length){
                case 0:
                    return c === '/';
                    break;
                case 1:
                    return c === '/' || c === '*';
                    break;
                default:
                    return t[1] === '/' ? c !== '\n': t[1] === '*' && (t[t.length-1] !== '/' || t[t.length-2] !== '*');
                    break;
            }
            
        },
        isWhiteSpace:function(){
            var c = this.char;
            return c ==='\n' || c === ' '|| c === '\t';
        },
        validate:function(){
            var that = this;
            var whiteSpace = userConfig.whiteSpace;
            var filter;
            if(that.type === Token['WhiteSpace'] && !whiteSpace){
                filter = true;
            }
            !filter && that.tokens.push({
                type:that.type,
                value:that.token
            });
            that.clearFlags();
            that.initType();
        },
        getToken:function(){
            var that = this;
            var char = that.char;
            /* Identifier */
            function parseIdentifier(){
                if(that.isIdentifier()){
                    that.token += char;
                }else {
                    if(that.isKeyword()){
                        if(that.isBooleanLiteral()){
                            that.type = Token['BooleanLiteral'];
                        }else if(that.isNullLiteral()){
                            that.type = Token['NullLiteral'];
                        }else {
                            that.type = Token['Keyword'];
                        }
                    }
                    that.validate();
                }
            }
            /* NumericLiteral */
            function parseNumericLiteral(){
                if(that.isNumericLiteral()){
                    that.token += char;
                }else {
                    that.validate();
                }
            }
            /* Punctuator */
            function parsePunctuator(){
                var t = that.token;
                /*********************
                 * +  * ==  * && * , *
                 * -  * === * || * ; *
                 * *  * !=  * !  * ( *
                 * /  * >   * '  * ) *
                 * %  * <   * "  * [ *
                 * ++ * >=  *    * ] *
                 * -- * <=  *    * { *
                 * ~  *     *    * } *
                 ********************/
                if(_.isIn(t,'\,|\;|\(|\)|\[|\]|\{|\}|:|?'.split('|'))){
                    that.validate();
                }else{
                    if(that.isPunctuator()){
                        that.token += char;
                    }else{
                        that.validate();
                    }
                }
            }
            /* StringLiteral */
            function parseStringLiteral(){
                if(that.isStringLiteral()){
                    that.token += char;
                }else {
                    that.validate();
                }
            }
            /* RegularExpression */
            function parseRegularExpression(){
                if(that.isRegularExpression()){
                    that.token += char;
                }else{
                    if(that.isComment()){
                        that.type = Token['Comment'];
                        that.token +=char;
                    }else{
                        that.validate();
                    }
                }
            }
            /* Comment */
            function parseComment(){
                if(that.isComment()){
                    that.token += char;
                }else{
                    that.validate();
                }
            }
            /* WhiteSpace */
            function parseWhiteSpace(){
                if(that.isWhiteSpace()){
                    that.token += char;
                }else{
                    that.validate();
                }
            }
            /* type router */
            switch(that.type){
                case null:
                    that.initType();
                    break;
                case 'Identifier':
                    parseIdentifier();
                    break;
                case 'Keyword':
                    parseKeyword();
                    break;
                case 'NumericLiteral':
                    parseNumericLiteral();
                    break;
                case 'Punctuator':
                    parsePunctuator();
                    break;
                case 'StringLiteral':
                    parseStringLiteral();
                    break;
                case 'RegularExpression':
                    parseRegularExpression();
                    break;
                case 'Comment':
                    parseComment();
                    break;
                case 'WhiteSpace':
                    parseWhiteSpace();
                    break;
            }
            that.end();
        }
    };

    function throwError(){
    
    }

    /* build tree class 
     *
     * based on https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
     */
    function Parser(cfg){
        this.source = cfg.code;
        this.tokens = new LexAnalyzer(userConfig);
        this.init();
    }
    Parser.prototype = {
        init:function(){
            console.log(this.tokens)
            this.syntaxTree = {};
        }
    };

    function parseBreakStatement(){
    
    }
    function parseContinueStatement(){
    
    }
    function parseDebuggerStatement(){
    
    }
    function parseDoWhileStatement(){
    
    }
    function parseForStatement(){
    
    }

    function parseFunctionDeclaration(){
    
    }
    function parseIfStatement(){
    
    }
    function parseReturnStatement(){
    
    }
    function parseSwitchStatement(){
    
    }

    function parseThrowStatement(){
    
    }
    function parseTryStatement(){
    
    }
    function parseVariableStatement(){
    
    }
    function parseWhileStatement(){
    
    }

    function parseWithStatement(){
    
    }
    /**
    * Programs
    * 
    * interface Program <: Node {
    *   type: "Program";
    *   body: [ Statement ];
    * }
    */

    /*
    * Function
    * interface Function <: Node {
    *   id: Identifier | null;
    *   params: [ Pattern ];
    *   defaults: [ Expression ];
    *   rest: Identifier | null;
    *   body: BlockStatement | Expression;
    *   generator: boolean;
    *   expression: boolean;
    * }
    */

    /**
     * Statements
     *
     * interface Statement <: Node { }
     */

    /* set options */
    function setOptions(code,o){
        userConfig = _.mix(options,o);
        _.mix(userConfig,{
            code:code
        });
    }
    /* exports */
    function parse(code,o){
        setOptions(code,o);
        return new Parser(userConfig).syntaxTree;
    }
    function tokenize(code,o){
        setOptions(code,o);
        return new LexAnalyzer(userConfig);
    }
    exports.version = '1.0.2';
    exports.parse = parse;
    exports.tokenize = tokenize;
});
/* vim: set sw=4 ts=4 et tw=80 : */
