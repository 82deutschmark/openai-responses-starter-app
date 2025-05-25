# Plan: Integrate OpenAI Image Generation into the App

**Goal:**
Enable users to generate images using OpenAI’s `gpt-image-1` model, securely and as part of the conversational assistant experience.

---

## Author & Model
- Author/Model: gpt-4.1
- Date: 2025-05-19

---

## Files to Create
- `app/api/generate-image/route.ts`  
  _API endpoint: Handles frontend requests, calls OpenAI image API securely, returns image URLs/data._

## Files to Modify
- `README.md`  
  _Add usage instructions, environment variable notes, and update author/model info._
- `docs/changelog.md`  
  _Append details of image generation feature with timestamp and author/model._
- Frontend component(s) (e.g., `app/page.tsx`, or a new component)  
  _Add UI for users to enter prompts and display generated images._
- `package.json`  
  _Ensure `openai` package is included; add scripts if needed._
- `.env.example`  
  _Add `OPENAI_API_KEY` placeholder and comments._

---

## Checklist
- [ ] Create a secure API route for image generation using OpenAI SDK and environment variable for the API key.
- [ ] Add or update frontend component(s) to:
    - Accept user prompt for image generation.
    - Call the new API route.
    - Display loading state, errors, and generated images.
- [ ] Update `README.md`:
    - Add instructions for setting up the API key.
    - Document the image generation feature.
- [ ] Update `docs/changelog.md`:
    - Add entry for image generation feature (with timestamp and author/model).
- [ ] Ensure `openai` package is present in `package.json`.
- [ ] Add `OPENAI_API_KEY` to `.env.example` and document its use.
- [ ] Add comments at the top of new/modified files explaining their purpose and how the project uses them, including author/model.

---

## Notes
- **Security:** Never expose your OpenAI API key in frontend code. All OpenAI calls must be made from the backend API route.
- **Modularity:** Keep backend and frontend code separate and well-commented.
- **Documentation:** Update all relevant docs and changelogs with every change.
- **Sanity check:** If you encounter errors or confusion, stop and ask for clarification.

---

## Progress Tracking
- Use this checklist to track the implementation of image generation step-by-step.
- Update this plan as needed if requirements change.
