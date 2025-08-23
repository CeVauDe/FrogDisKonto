import os

from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()


def main():
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.environ["OPENROUTER_API_KEY"],
    )

    completion = client.chat.completions.create(
        extra_body={},
        model="openai/gpt-oss-20b:free",
        messages=[{"role": "user", "content": "What is the meaning of life?"}],
    )
    print(completion.choices[0].message.content)


if __name__ == "__main__":
    main()
