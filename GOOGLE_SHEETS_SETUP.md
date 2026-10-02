# Connecting the shared purchase list (Google Sheets)

Right now, "Mark as purchased" saves the buyer's details in their own browser.
Follow these steps once, and every claim will be shared with all visitors,
Babylist-style. Takes about 10 minutes.

## What you are building

A Google Form (invisible to visitors, the site submits to it directly) →
a Google Sheet collecting the claims → a published CSV the site reads on every
visit. No coding on your side, just clicking.

## Steps

### 1. Create the Form

1. Go to [forms.google.com](https://forms.google.com) and start a blank form.
   Name it "Baby Registry Purchase Claims".
2. Add these 5 short-answer questions **in this order**, with these exact titles:
   1. `Item ID`
   2. `Your Name` (toggle Required on)
   3. `Where did you buy it?` (toggle Required on)
   4. `Order Number`
   5. `Message for the parents` (change to Paragraph type)
3. Turn off "Collect email addresses" (Settings tab). No sign-in needed.

### 2. Link a response Sheet

1. In the Form, go to the **Responses** tab → **Link to Sheets** → Create a new
   spreadsheet. Name it "Baby Registry Claims".

### 3. Get the entry IDs

The site submits to the Form programmatically, so it needs each question's
internal entry ID:

1. In the Form editor, click the three-dot menu (top right) →
   **Get pre-filled link**.
2. Type a dummy value into every field (e.g. `x`) and click **Get link**.
3. Copy that link. It looks like:
   `https://docs.google.com/forms/d/e/XXXX/viewform?usp=pp_url&entry.1111111111=x&entry.2222222222=x...`
4. The numbers after each `entry.` are the entry IDs, in the same order as
   your questions: Item ID, Your Name, Where did you buy it?, Order Number,
   Message for the parents. Write them down.

### 4. Get the submit URL

Take the pre-filled link from step 3 and replace `/viewform` (everything from
`?` onward can go) with `/formResponse`:

`https://docs.google.com/forms/d/e/XXXX/formResponse`

### 5. Publish the response Sheet as CSV

1. Open the linked Google Sheet → **File** → **Share** → **Publish to web**.
2. Under "Link", choose the **Responses** tab (or "Form Responses 1") and
   format **CSV** (not Web page). Click **Publish** and copy the link.
3. Anyone with this link can read the responses, which is how the site shows
   claims to visitors.

### 6. Wire it into the site

In `data.js`, fill in `CLAIM_CONFIG`:

```js
var CLAIM_CONFIG = {
  formUrl: "https://docs.google.com/forms/d/e/XXXX/formResponse",
  entryIds: {
    itemId: "entry.1111111111",
    name: "entry.2222222222",
    platform: "entry.3333333333",
    order: "entry.4444444444",
    message: "entry.5555555555"
  },
  sheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/..../pub?...&output=csv"
};
```

Commit and push. Done.

### 7. Test it

Open the live registry, mark any item as purchased with a test name, wait
about a minute, then reload in an incognito window. The item should show
"Purchased by <test name>". Delete the test row from the Sheet afterwards.

## Privacy notes

- The published CSV is **public**: anyone who finds the link can read every
  claim, including order numbers. That is how the site can display them.
- The order-number field is optional in the form. Tell gifters to share one
  only if they are comfortable with it being visible.
- If you ever want claims moderated before they appear, add a column to the
  Sheet and ask for the moderation-gate variant (the Kaalo Diary site uses
  this pattern).

## Troubleshooting

- **Claims don't appear:** the published CSV can lag a minute or two behind
  new submissions. Also check the entry IDs match the question order.
- **Wrong item marked:** the Item ID is submitted automatically and hidden
  from buyers, so this should not happen. If it does, fix or delete the row
  in the Sheet.
- **Undo:** a buyer can undo a claim saved in their own browser, but a claim
  already sent to the Sheet can only be removed by deleting its row there.
