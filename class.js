/*
 * A pythonic way of declaring classes inspired by John Resig's Class
 * 
 * Declaring a class:
 * var MyClass= Class.create({
 *     __init__: function(kwargs){
 *         if(kwargs.liquor) {
 *             this.myFavoriteLiquor= kwargs.liquor;
 *         } else {
 *             this.alcoholic= false;
 *         }
 *     }
 *     ,alcoholic: true
 * });
 * 
 * var me= MyClass({
 *     liquor: 'Amaretto di Saronno'
 * });
 * var myFriend= MyClass({
 *     liquor: 'Jagermeister'
 * });
 * var myWife= MyClass({
 *     liquor: null
 * });
 * 
 * myWife.alcoholic // false
 * me.alcoholic // true
 * myFriend.myFavoriteLiquor // Jagermeister
 * 
 * P.S. Of course those are only examples...
 */

(function(__global__){
	var
		pyAttrs= {
			__new__: function(classObj){
				// the instantiator method responsible to give back an instance
				// of the class 'classObj'
				
				return new classObj();
			}
			,__init__: function(kwargs){
				var name;
				
				for(name in kwargs) {
					this[name]= kwargs[name];
				}
				
				return this;
			}
			,__meta__: function(){ throw new NotImplemented() }
			
			,__name__: 'Class'
			,__call__: null
			,__parent__: null
			
			//,__get__: function(){ throw new NotImplemented() }
			//,__set__: function(){ throw new NotImplemented() }
			//,__del__: function(){ throw new NotImplemented() }
			
			//,__getattr__: function(){ throw new NotImplemented() }
			//,__setattr__: function(){ throw new NotImplemented() }
			//,__delattr__: function(){ throw new NotImplemented() }
			
			,__iter__: function(){ throw new NotImplemented() }
			
			,__len__: function(){
				// The __len__ method returns the length of the object
				// or the length
				var
					nKeys= 0
					,name
				;
				
				// does it have a length attribute?
				if(this.length !== undefined) {
					return this.length
				}
				
				// find out what's the length of this object based on own properties
				for(name in this) {
					if(this.hasOwnProperty(name)) {
						nKeys+= 1;
					}
				}
				
				return nKeys;
			}
			
			,__repr__: function(){
				return "<" + this.__class__.__name__ + ": " + this.__class__.__name__ + " object>";
			}
			,__str__: function(){
				return this.__repr__.apply(this, arguments);
			}
			,__unicode__: function(){ throw new NotImplemented() }
			//
			//// static class init
			//,__metaclass__: {
			//	__repr__: function(){
			//		return "<class " + this.__name__ + ">";
			//	}
			//	,__name__: 'Class'
			//	,__str__: function(){
			//		return this.__repr__.apply(this, arguments);
			//	}
			//	,__unicode__: function(){ throw new NotImplemented() }
			//}
		}
		,jsPrototype= {
			toString: function(){
				return this.__repr__.apply(this, arguments);
			}
			//,toLocaleString: function(){}
			//,toSource: function(){}
			//,valueOf: function(){}
		}
		,jsStatic= {
			__iter__: function(){
				return this.__iter__.apply(this, arguments);
			}
			,toString: function(){
				return this.__repr__.apply(this, arguments);
			}
		}
		,NotImplemented= new Error('Not implemented.')
		,klassInitializing= false
		,fnTest= /xyz/.test(function(){var xyz;}) ? /\b_super\b/ : /.*/
		,Class= function(kwargs){
			return;
		}
	;
	
	// Create a new Class that inherits from the current class.
	Class.create= function(kwargs) {
		var
			_super_class= this
			,_super= this.prototype
			,prototype
			,metaClass= {}
			,name
			,__class__
			,instanceInitializing= false
			,metaClass
		;
		
		// metaclass init
		if(kwargs.__metaclass__) {
			metaClass= kwargs.__metaclass__();
			
			delete kwargs.__metaclass__;
		}
		for(name in jsStatic) {
			metaClass[name]= jsStatic[name];
		}
		for(name in kwargs) {
			if(kwargs[name] && kwargs[name].staticMethod) {
				metaClass[name]= kwargs[name];
				delete kwargs[name];
			}
		}
		
		// build the prototype
		for(name in pyAttrs) {
			if(!kwargs.hasOwnProperty(name)) {
				kwargs[name]= pyAttrs[name];
			}
		}
		for(name in jsPrototype) {
			if(!kwargs.hasOwnProperty(name)) {
				kwargs[name]= jsPrototype[name];
			}
		}
		
		// The dummy class constructor
		// All construction is actually done in the __new__ method
		__class__= function(){
			var
				newMethod
				,newInstance
				,args= Array.prototype.slice.call(arguments)
			;
			args.unshift(__class__);
			
			if(!(this instanceof __class__)) {
				newMethod= __class__.prototype.__new__;
			} else if(!instanceInitializing) {
				newMethod= this.__new__;
			}
			
			if( !(this instanceof __class__) || !instanceInitializing ) {
				instanceInitializing= true;
				newInstance= newMethod.apply(__class__, args);
				instanceInitializing= false;
				
				if ( !klassInitializing && newInstance.__init__ && newInstance instanceof __class__ ) {
					newInstance.__init__.apply(newInstance, arguments);
				}
				
				if(!newInstance.__call__) {
					return newInstance;
				}
				
				// allow the new instance of the class to be callable
				// it's good to make callable objects, but the returned
				// object not being an instance of __class__
				callableObject= function(){
					return newInstance.__call__.apply(newInstance, arguments);
				};
				
				for(name in this) {
					callableObject[name] = this[name];
				}
				
				return callableObject;
			}
		};
		
		// attach the static properties
		for(name in metaClass) {
				// Copy the static methods over onto the class
				__class__[name] = typeof metaClass[name] == "function" && typeof __class__[name] == "function" && fnTest.test(metaClass[name]) ?
					(function(name, fn){
						return function() {
							var
								tmp= this._super
								,ret
							;
							
							this._super= _super_class[name];
							ret= fn.apply(this, arguments);
							this._super= tmp;
							
							return ret;
						};
					})(name, metaClass[name])
					:
					metaClass[name];
		}
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		klassInitializing= true;
		prototype= new this();
		klassInitializing= false;
		
		for(name in kwargs) {
			// Copy the properties over onto the new prototype
			// Check if we're overwriting an existing function
			prototype[name]= typeof kwargs[name] == "function" && typeof _super[name] == "function" && fnTest.test(kwargs[name]) ?
				(function(name, fn){
					return function() {
						var tmp = this._super,
							ret;
						
						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super= _super[name];
						
						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						ret= fn.apply(this, arguments);
						this._super= tmp;
						
						return ret;
					};
				})(name, kwargs[name])
				:
				kwargs[name];
		}
		
		// Populate our constructed prototype object
		__class__.prototype= prototype;
		__class__.prototype.__class__= __class__;
		
		// Enforce the constructor to be what we expect
		__class__.constructor= __class__;
		
		// And make this class extendable
		for(name in this){
			if(this.hasOwnProperty(name) && name != 'prototype'){
				__class__[name] = this[name];
			}
		}
		__class__.create= arguments.callee;
		
		if(kwargs.__name__ && kwargs.__parent__) {
			var
				current= kwargs.__parent__,
				parts= kwargs.__name__.split(/\./)
			;
			
			for(i= 0; i < parts.length - 1; i++){
				current = current[parts[i]] || ( current[parts[i]] = {} );
			}
			
			current[parts[parts.length - 1]]= __class__;
			__class__.__name__= parts[parts.length - 1];
		}
		
		// class initialisation
		//if(__class__.__init__) {
		//	__class__.__init__(__class__);
		//}
		
		if(_super_class.extended) {
			_super_class.extended(__class__);
		}
		
		return __class__;
	};
	
	__global__.C= Class;
})(this);
