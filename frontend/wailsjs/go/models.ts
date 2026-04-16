export namespace main {
	
	export class CompressRequest {
	    inputPath: string;
	    outputFormat: string;
	    outputPath: string;
	    qualityPreset: string;
	
	    static createFrom(source: any = {}) {
	        return new CompressRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.inputPath = source["inputPath"];
	        this.outputFormat = source["outputFormat"];
	        this.outputPath = source["outputPath"];
	        this.qualityPreset = source["qualityPreset"];
	    }
	}
	export class ConvertRequest {
	    inputPath: string;
	    outputFormat: string;
	    outputPath: string;
	
	    static createFrom(source: any = {}) {
	        return new ConvertRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.inputPath = source["inputPath"];
	        this.outputFormat = source["outputFormat"];
	        this.outputPath = source["outputPath"];
	    }
	}
	export class ConvertResult {
	    command: string;
	    outputPath: string;
	    outputText: string;
	
	    static createFrom(source: any = {}) {
	        return new ConvertResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.command = source["command"];
	        this.outputPath = source["outputPath"];
	        this.outputText = source["outputText"];
	    }
	}

}

