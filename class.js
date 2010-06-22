/*
 * A pythonic way of declaring classes inspired by John Resig's Class
 *
 */

(function(__global__){
	var
		pyAttrs= {
			__new__: function(){
				var
					name
					,callableObject
					,_this= this
				;
				
				if ( !initializing && this.__init__ ) {
					this.__init__.apply(this, arguments);
				}
				
				if(this.__call__) {
					// allow the new instance of the class to be callable
					// it's good to make callable objects
					callableObject= function(){
						return _this.__call__.apply(_this, arguments);
					};
					
					for(name in this) {
						callableObject[name] = this[name];
					}
					
					return callableObject;
				} else {
					return this;
				}
			}
			,__init__: function(kwargs){
				var name;
				
				for(name in kwargs) {
					this[name]= kwargs[name];
				}
				
				return this;
			}
			//,__class__: function(){ throw new NotImplemented() }
			,__meta__: function(){ throw new NotImplemented() }
			
			,__name__: 'Class'
			,__call__: null
			,__parent__: __global__
			
			,__get__: function(){ throw new NotImplemented() }
			,__set__: function(){ throw new NotImplemented() }
			,__del__: function(){ throw new NotImplemented() }
			
			,__getattr__: function(){ throw new NotImplemented() }
			,__setattr__: function(){ throw new NotImplemented() }
			,__delattr__: function(){ throw new NotImplemented() }
			
			,__iter__: function(){ throw new NotImplemented() }
			,__len__: function(){
				// The __len__ method returns the length of the object
				// or the length
				var
					nKeys= 0
					,name
				;
				
				for(name in this) {
					if(this.hasOwnProperty(name)) {
						nKeys+= 1;
					}
				}
				
				return nKeys;
			}
			
			,__repr__: function(){
				return this.__str__.apply(this, arguments);
			}
			,__str__: function(){
				return "<" + this.__class__.__name__ + ": " + this.__class__.__name__ + " object>";
			}
			,__unicode__: function(){ throw new NotImplemented() }
		}
		,jsAttrs= {
			toString: function(){
				return this.__str__.apply(this, arguments);
			}
			//,toLocaleString: function(){}
			//,toSource: function(){}
			//,valueOf: function(){}
		}
		,NotImplemented= new Error('Not implemented.')
		,initializing= false
		,fnTest= /xyz/.test(function(){var xyz;}) ? /\b_super\b/ : /.*/
		,Class= function(){
			if(!(this instanceof Class)) {
				return Class.extend.apply(this, arguments);
			}
		}
	;
	
	// Create a new Class that inherits from the current class.
	Class.extend= function(kwargs) {
		var
			_super_class
			,_super
			,prototype
			,name
			,i
			,__class__
			,name
			,staticMethods= {}
		;
		
		for(name in pyAttrs) {
			if(!kwargs.hasOwnProperty(name)) {
				kwargs[name]= pyAttrs[name];
			}
		}
		
		for(name in jsAttrs) {
			if(!kwargs.hasOwnProperty(name)) {
				kwargs[name]= jsAttrs[name];
			}
		}
		
		_super_class= this;
		_super= this.prototype;
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing= true;
		prototype= new this();
		initializing= false;
		
		// Copy the properties over onto the new prototype
		for(name in kwargs) {
			if(kwargs[name] && kwargs[name].staticMethod) {
				staticMethods[name]= kwargs[name];
			} else {
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
		}
		
		// The dummy class constructor
		// All construction is actually done in the init method
		__class__= kwargs.__new__;
		
		for(name in staticMethods) {
		  __class__[name] = typeof staticMethods[name] == "function" &&
			typeof __class__[name] == "function" && fnTest.test(staticMethods[name]) ?
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
				})(name, staticMethods[name])
				:
				staticMethods[name];
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
		__class__.extend= arguments.callee;
		
		if(kwargs.__name__) {
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
		if(__class__.__init__) {
			__class__.__init__(__class__);
		}
		
		if(_super_class.extended) {
			_super_class.extended(__class__);
		}
		
		return __class__;
	};
	
	__global__.Class= Class;
})(this);
