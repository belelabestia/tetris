export const match = expression => _default => (...cases) =>
    cases.reduce(
        (match, [_case, _then]) => expression == _case ? _then() : match,
        _default
    )