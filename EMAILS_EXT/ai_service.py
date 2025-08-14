from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from text_processor import TextProcessor

app = FastAPI(title="Email Extraction AI Service")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

processor = TextProcessor()

class ExtractRequest(BaseModel):
	text: str

class ExtractResponse(BaseModel):
	data: dict

@app.get("/health")
def health():
	return {"status": "ok"}

@app.post("/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest):
	data = processor.extract_all_job_info(req.text)
	return {"data": data}

if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="0.0.0.0", port=8001)
