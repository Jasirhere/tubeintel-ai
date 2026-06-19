def split_text_into_chunks(
    text: str,
    max_words: int = 1500,
    overlap_words: int = 100,
) -> list[str]:
    """
    Divide long text into overlapping word-based chunks.

    The overlap helps preserve context between adjacent chunks.
    """
    cleaned_text = " ".join(text.split())
    words = cleaned_text.split()

    if not words:
        return []

    if max_words <= 0:
        raise ValueError("max_words must be greater than zero.")

    if overlap_words < 0:
        raise ValueError("overlap_words cannot be negative.")

    if overlap_words >= max_words:
        raise ValueError(
            "overlap_words must be smaller than max_words."
        )

    chunks: list[str] = []
    start_position = 0

    while start_position < len(words):
        end_position = min(
            start_position + max_words,
            len(words),
        )

        chunk = " ".join(
            words[start_position:end_position]
        ).strip()

        if chunk:
            chunks.append(chunk)

        if end_position >= len(words):
            break

        start_position = end_position - overlap_words

    return chunks


def group_texts_by_character_limit(
    texts: list[str],
    maximum_characters: int = 24000,
) -> list[list[str]]:
    """
    Group text items without exceeding an approximate character limit.
    """
    if maximum_characters <= 0:
        raise ValueError(
            "maximum_characters must be greater than zero."
        )

    groups: list[list[str]] = []
    current_group: list[str] = []
    current_length = 0

    for text in texts:
        text_length = len(text)

        if (
            current_group
            and current_length + text_length > maximum_characters
        ):
            groups.append(current_group)
            current_group = []
            current_length = 0

        current_group.append(text)
        current_length += text_length

    if current_group:
        groups.append(current_group)

    return groups